

function ConiferousTrees(nightMode) {

    var _this = this;
    var THREE = require('three');
    var Randoms = require('./Randoms.js');
    var Colors = require('./Colors.js');

    var colorHelper = new Colors();
    var _r = new Randoms();

    var NIGHT_MODE = nightMode;

    this.options = _initOptions();
    var _options = this.options;

    


    var _numBranches = 0;

    /**
     * What radius should we use for building the base of the trees?
     * --------------------------------------------------------------
     * @return {Number}
     */
    function _pickRadius() {
        var sizeRange = Math.random();

        if (sizeRange < 0.2) {
            return _r.random(0.1, 0.3);
        } else if (sizeRange < 0.5) {
            return _r.random(0.4, 0.9);
        } else if (sizeRange < 0.95) {
            return _r.random(1, 1.4);
        } else {
            return _r.random(1.5, 2.8);
        }
    }

    /**
     * How less likely do branches become at each node?
     * ----------------------------------------------------
     * @return {Number} 0-1
     */
    function _pickDecay(){
        var decayRange = Math.random();
        if (decayRange < 0.3){
            return _r.random(0.01, 0.03);
        } else if (decayRange < 0.9){
            return _r.random(0.03, 0.06);
        } else {
            return _r.random(0.06, 0.07);
        }
    }

    /**
     * What radius should we use for creating the tree leaves?
     * ---------------------------------------------------------
     * @return {Number} 
     */
    function _pickLeafSize() {
        var sizeRange = Math.random();
        if (sizeRange < 0.33) {
            return _r.random(0.15, 0.4);
        } else if (sizeRange < 0.7) {
            return _r.random(0.4, 0.8);
        } else if (sizeRange < 0.9) {
            return _r.random(0.8, 1);
        } else {
            return _r.random(1, 1.4);
        }

    }


    /**
     * Generate a tree shape as an array of arrays.  
     * --------------------------------------------------------------------------------------
     * @param  {Array} startingStructure 
     * @param  {int} startingDepth          -- how deep into the main tree is this subtree?
     * 
     * @return {Array}                      
     */
    function _randomTreeData(startingStructure, startingDepth, maxDepth) {

        var structure = startingStructure || [];
        var depth = startingDepth || 0;
        var max_d = maxDepth || _options.MAX_DEPTH; 

        if (depth < max_d) {
            var branchChance = (_options.BRANCH_P - Math.min(_options.BRANCH_P, _options.CHANCE_DECAY * depth));

            while (structure.length < _options.MAX_BRANCHES_PER_NODE && Math.random() < branchChance) {

                if (_numBranches > _options.MAX_BRANCHES_TOTAL) {
                    break;
                }

                var newBranch = _randomTreeData([], depth + 1, max_d);
                structure.push(newBranch);
                _numBranches++;
            }
  
        }
        return structure;
    }


    /**
     * How deep is this array? 
     * ---------------------------------------------------------
     * @param  {Array} arr 
     * 
     * @return {int}        -- deepest level of nesting present
     */
    function _depthOfArray(arr) {
        var i;
        var deepest = 0;
        var subdepths = [];

        for (i = 0; i < arr.length; i++) {
            subdepths.push(_depthOfArray(arr[i]));
        }

        for (i = 0; i < subdepths.length; i++) {
            if (subdepths[i] > deepest) {
                deepest = subdepths[i];
            }
        }

        return deepest+1;
    }


        
    function _buildLeaf(leafCol, leafSize, leafWidth){
        var leaf = _circleMesh(leafCol, leafSize);
        leaf.scale.x = leafWidth;
        return leaf;
    }

    function _circleMesh(col, radius) {

        var geometry = new THREE.CircleGeometry(radius, 8);
        var material = new THREE.MeshBasicMaterial({
            color: colorHelper.parseHex(col)
        });

        return new THREE.Mesh(geometry, material);
    }

    function _sphereMesh(col, radius){
        var sphGeom = new THREE.SphereGeometry(radius, 2, 2);
        var hex;

        for (i = 0; i < sphGeom.faces.length; i += 2) {
            hex = colorHelper.parseHex(col);
            sphGeom.faces[i].color.setHex(hex);
            sphGeom.faces[i + 1].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });

        return new THREE.Mesh(sphGeom, material);
    }

 
    /**
     * Convert degrees to radians
     * --------------------------------------------
     * @param  {Number} degree  
     * 
     * @return {Number}        -- the equivalent number in radians
     */
    function _de2ra(degree) {
        return degree * (Math.PI / 180);
    }

    /**
     * "Branch"
     * Make a cylindrical mesh and ball "joint" representing one branch segment of a tree.
     * ---------------------------------------------------------------------------------------------------
     * @param  {Number} baseLength          -- how long are branches at base? Will vary based on this.
     * @param  {int} distanceFromTip        -- how many nodes away from the branch tip is this node?
     * @param  {int} distanceFromRoot       -- how many nodes is this node away from the ground?
     * @param  {int} fullTreeDepth          -- how many nodes has the longest path from root to tip?
     * @param  {Number} minRad              -- minimum branch radius
     * @param  {Number} maxRad              -- maximum branch radius
     * 
     * @return {THREE.Object3D}             -- a 3d object holding the branch segment
     */
    function _buildBranch(baseLength, distanceFromTip, distanceFromRoot, fullTreeDepth, minRad, maxRad) {

        var i;
        var length = baseLength * _r.random(1, 1.4);

        // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
        var referenceLength = Math.min(length, _options.BRANCH_L);

        var baseRadius = function(distFromTip, distFromRoot) {
            var fromBottom = minRad + ((fullTreeDepth - distFromRoot) / fullTreeDepth) * (maxRad - minRad);
            var fromTop = minRad + ((distFromTip) / fullTreeDepth) * (maxRad - minRad);
            return fromTop;
        };

        if(distanceFromRoot <= 1){
            length *= 2;
        }

        var radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
        var radiusTop = baseRadius(Math.max(0, distanceFromTip - 1), distanceFromRoot + 1);

        var cylGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 8);
        var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
        var hex;

        var propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
        var propTop = 1 - propBtm;

        var branchCol = colorHelper.mixHexCols(_options.COLOR_BTM, _options.COLOR_TOP, propBtm, propTop);

        for (i = 0; i < cylGeom.faces.length; i += 2) {
            hex = colorHelper.parseHex(branchCol);
            cylGeom.faces[i].color.setHex(hex);
            cylGeom.faces[i + 1].color.setHex(hex);
        }

        for (i = 0; i < sphGeom.faces.length; i += 2) {
            hex = colorHelper.parseHex(branchCol);
            sphGeom.faces[i].color.setHex(hex);
            sphGeom.faces[i + 1].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });

        var cylinder = new THREE.Mesh(cylGeom, material);
        cylinder.position.y = length / 2;

        var sphere = new THREE.Mesh(sphGeom, material);

        var tip = new THREE.Object3D();
        tip.position.y = length;
        tip.add(sphere);

        var branch = new THREE.Object3D();
        branch.add(cylinder);
        branch.add(tip);
        branch.tip = tip;
        branch.length = length;

        if (distanceFromTip == 1) {
            //_makeLeavesAround(branch.tip, _r.randomInt(_options.LEAF_DENSITY*2, _options.LEAF_DENSITY*3), _options.LEAF_COLS, _options.LEAF_SIZE, 0, 0, _options.LEAF_W);
        }

        return (branch);
    }

    /**
     * Add a bunch of leaves around the given object.
     * -----------------------------------------------------------------------------------------------------
     * @param  {THREE.Object3D} obj3d   -- the thing to add leaves to
     * @param  {int} numLeaves 
     * @param  {Array of hex strings} colors    
     * @param  {Number} leafRadius 
     * @param  {Number} yAdjust         -- how high above the pivot point
     * @param  {Number} rAdjust         -- how far out from the center to place leaves
     * 
     * @return {void}                   -- The leaves will be added as children of the obj.
     */
    function _makeLeavesAround(obj3d, numLeaves, colors, leafRadius, yAdjust, rAdjust, leafWidth) {

        var baseTwist = _r.random(Math.PI*2);
        for (i = 0; i < numLeaves; i++) {
            var sheath = new THREE.Object3D();
            var leaf_col = _r.randomFrom(colors);

            var newLeaf = _buildLeaf(leaf_col, leafRadius, leafWidth);
            newLeaf.position.y = leafRadius/2;
            

            //newLeaf.rotation.x = -Math.PI/2;

            newLeaf.rotation.x = _r.random(-_options.ANGLE_MAX,-_options.ANGLE_MIN);
            sheath.add(newLeaf);
            sheath.rotation.y = baseTwist + i*Math.PI*2/numLeaves;
            sheath.position.y -= _r.random(0,_options.BRANCH_L/2);

            //obj3d.position.y -= _options.BRANCH_L;
            obj3d.add(sheath);
        }
    }

    /**
     * Build a tree!  Or a subtree!  In 3D.
     * -------------------------------------------------------------------------------------
     * @param  {Array of arrays} treeData       -- structure to follow
     * @param  {Number} branchLength  
     * @param  {int} depth                      -- how deep is this subtree?
     * @param  {int} height                     -- how far from the root is this subtree?
     * @param  {int} fullTreeDepth              -- how deep is the full tree?
     * @param  {Number} maxBranchRad            -- radius at the base of the tree
     * 
     * @return {THREE.Object3D}                 -- the 3D tree!
     */
    function _buildTree(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad, corePiece) {

        
        var baseTwist = _r.random(Math.PI*2);
        var mainTrunk = _depthOfArray(treeData) == fullTreeDepth;

        var minBranchRad = Math.min(_options.BRANCH_R_MIN, maxBranchRad*0.5);
        var root = _buildBranch(branchLength, depth, height, fullTreeDepth, minBranchRad, maxBranchRad);

        var minBend = _de2ra(corePiece ? _options.ANGLE_MIN : -_options.ANGLE_MIN);
        var maxBend = _de2ra(corePiece ? _options.ANGLE_MAX : -_options.ANGLE_MAX);

        // pick the branch with the greatest depth; that's the trunk.
        var trunkIndex;
        var greatestDepth = 0;
        for (var i = 0; i < treeData.length; i++) {
            var branchDepth = _depthOfArray(treeData[i]);
            if(branchDepth > greatestDepth){
                greatestDepth = branchDepth;
                trunkIndex = i;
            }
        }

        for (var i = 0; i < treeData.length; i++) {

            //var newBranchL = (corePiece) ? branchLength * _options.LENGTH_MULT : branchLength*_options.LENGTH_MULT*0.9;
            var newBranchL = branchLength * _options.LENGTH_MULT;

            var newBranch; 

            if(i==trunkIndex){
                newBranch = _buildTree(treeData[i], newBranchL, _depthOfArray(treeData[i]), height + 1, fullTreeDepth, maxBranchRad, corePiece);
                newBranch.rotation.x = root.rotation.x + (corePiece ? 0 : -0.3);

                // + _r.random(0,0.1);
                //newBranch.rotation.z = root.rotation.x + _r.random(0,0.1);
            } else {
                newBranch = _buildTree(treeData[i], newBranchL, _depthOfArray(treeData[i]), height + 1, fullTreeDepth, maxBranchRad*0.5, false);

                newBranch.rotation.x = _r.random(minBend, maxBend);
                //newBranch.rotation.z = _r.random(minBend, maxBend); 
            }

            var branchNode = new THREE.Object3D();
            branchNode.add(newBranch);
            branchNode.rotation.y = baseTwist + i*Math.PI*2/Math.max(1,treeData.length-1);
        
            // Position this subtree somewhere along the parent branch if such exists.
            //newBranch.position.y = (height == 0) ? 0 : -Math.random() * (branchLength / 3);

            root.tip.add(branchNode);
        }

        return root;

    }

    /**
     * Add roots to the tree
     * --------------------------
     * @params as per _buildTree
     */
    function _treeWithRoots(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad) {
        
        var body = _buildTree(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad, true);
        
        var numRoots = _r.randomInt(3,10);  
        var startRot = _r.random(Math.PI*2);
        var rootColInt = colorHelper.parseHex(_options.COLOR_BTM);

        //console.log(numRoots+" roots\n");
        for(var i=0; i<numRoots; i++){

            var rootRad = _r.random(maxBranchRad*0.3,maxBranchRad*0.7);
            var rootLength = _r.random(branchLength*0.02, branchLength*0.1);

            var cylGeom = new THREE.CylinderGeometry(rootRad, 0.01, rootLength, 8);       
            for (var f = 0; f < cylGeom.faces.length; f ++) {
                cylGeom.faces[f].color.setHex(rootColInt);
            }

           var cylMat = new THREE.MeshBasicMaterial({
                vertexColors: THREE.FaceColors,
                overdraw: 0.5
            });

            var cone = new THREE.Mesh(cylGeom, cylMat);         
            var newRoot = new THREE.Object3D();
            cone.rotation.x = -Math.PI/2.4;
            cone.position.z = rootLength/2 + (maxBranchRad/2)*0.9;
            
            newRoot.add(cone);
            newRoot.rotation.y = startRot + i*(Math.PI*2/numRoots);

            body.add(newRoot);
        }
        return body;
    }

    this.getTree = function(options){
        
        _numBranches = 0;
        _setParameters(options);
        
        var data = [];
        while (data.length == 0) {
            data = _randomTreeData();
        }
        console.log(_numBranches + " branches");

        return _treeWithRoots(data, _options.BRANCH_L, _depthOfArray(data), 0, _depthOfArray(data), _options.BRANCH_R_MAX);
    };

    function _setParameters(options){
        _o = this.options = options;
    }


    function _initOptions(){
        var maxRad = _pickRadius();

        // The bottom of the tree is a random dark colour and the top is a variation on same
        //var bottom_color = NIGHT_MODE ? colorHelper.randomDark() : colorHelper.brightenByAmt(colorHelper.randomDark(), _r.random(30,80));
        
        var bottom_color = colorHelper.randomHex();

        // Leaves on the trees could be any color of the rainbow!
        // We keep the number of leaf colors down so we don't run out of colors.
        var leafBaseColor = NIGHT_MODE ? colorHelper.brightenByAmt(colorHelper.randomHex(), -60) : colorHelper.variationsOn(colorHelper.randomHex(), 80);
        var leafColors = [];
        for (i = 0; i < 8; i++){
            leafColors.push(colorHelper.variationsOn(leafBaseColor, 30));
        }

        var options = {
            BRANCH_R_MAX: maxRad,
            BRANCH_R_MIN: maxRad * _r.random(0.03),
            BRANCH_L: _r.random(2, 8), 
            BRANCH_P: _r.random(0.85, 0.95),
            CHANCE_DECAY: _pickDecay(),
            LENGTH_MULT: _r.random(0.85, 0.95),
            ANGLE_MIN: _r.random(100, 110), 
            ANGLE_MAX: _r.random(120, 135), 
            COLOR_BTM: bottom_color, 
            COLOR_TOP: colorHelper.variationsOn(bottom_color, 180), 
            LEAF_COLS: leafColors, 
            LEAF_SIZE: _pickLeafSize(),
            LEAF_DENSITY: _r.randomInt(24),
            LEAF_W: _r.random(0.1,0.2),
            MAX_DEPTH: 20, 
            MAX_BRANCHES_TOTAL: 3333, 
            MAX_BRANCHES_PER_NODE:  _r.randomInt(5, 6),
            LEAF_DENSITY: _r.randomInt(24)
        };

        return options;
    };
}

module.exports = ConiferousTrees;
