

function DeciduousTrees(options) {

    var _this = this;
    var THREE = require('three');
    var Randoms = require('./Randoms.js');
    var Colors = require('./Colors.js');
    var Meshes = require('./Meshes.js');

    var _c = new Colors();
    var _r = new Randoms();

    this.options = _initOptions(options);
    var _options = this.options;
    
    var _m = new Meshes(_options);
   
    var _rainbow = _options.RAINBOW;

    var _numBranches = 0;

    /**
     * What radius should we use for building the base of the trees?
     * --------------------------------------------------------------
     * @return {Number}
     */
    function _pickRadius() {
        var sizeRange = Math.random();

        if (sizeRange < 0.1) {
            return _r.random(0.1, 0.4);
        } else if (sizeRange < 0.7) {
            return _r.random(0.4, 0.7);
        } else if (sizeRange < 0.8) {
            return _r.random(0.9, 1.5);
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
        if (decayRange < 0.2){
            return _r.random(0, 0.02);
        } else if (decayRange < 0.8){
            return _r.random(0.02, 0.05);
        } else {
            return _r.random(0.05, 0.07);
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
    function _randomTreeData(startingStructure, startingDepth) {

        var structure = startingStructure || [];
        var depth = startingDepth || 0;

        if (depth < _options.MAX_DEPTH) {
            var branchChance = (_options.BRANCH_P - Math.min(_options.BRANCH_P*0.8, _options.CHANCE_DECAY * depth));

            while (_numBranches==0 || (structure.length < _options.MAX_BRANCHES_PER_NODE && _numBranches<_options.MAX_BRANCHES_TOTAL && Math.random() < branchChance)) {

                var newBranch = _randomTreeData([], depth + 1);
                structure.push(newBranch);
                _numBranches++;
            }

            if(structure == []){
                var tipBranches = _r.randomInt(2,3);
                for(var i=0; i<tipBranches.length; i++){
                    structure.push([]);    
                }
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
        var leaf = _m.circleMesh(leafCol, leafSize);
        leaf.scale.x = leafWidth;
        return leaf;
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
        if(distanceFromTip==1){
            referenceLength = referenceLength/2; 
        }

        var baseRadius = function(distFromTip, distFromRoot) {
            var fromBottom = minRad + ((fullTreeDepth - distFromRoot) / fullTreeDepth) * (maxRad - minRad);
            var fromTop = minRad + ((distFromTip) / fullTreeDepth) * (maxRad - minRad);
            return fromTop;
        };

        var radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
        var radiusTop = baseRadius(Math.max(0, distanceFromTip - 1), distanceFromRoot + 1);

        var cylGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, referenceLength, 8);
        var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
        var hex;

        var propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
        var propTop = 1 - propBtm;

        var branchCol = _c.mixHexCols(_options.COLOR_BTM, _options.COLOR_TOP, propBtm, propTop);

        hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
        for (i = 0; i < cylGeom.faces.length; i += 2) {
            //hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
            cylGeom.faces[i].color.setHex(hex);
            cylGeom.faces[i + 1].color.setHex(hex);
        }

        for (i = 0; i < sphGeom.faces.length; i += 2) {
            hex = _c.parseHex(branchCol);
            sphGeom.faces[i].color.setHex(hex);
            sphGeom.faces[i + 1].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });

        var cylinder = new THREE.Mesh(cylGeom, material);
        cylinder.position.y = referenceLength / 2;

        var sphere = new THREE.Mesh(sphGeom, material);

        var tip = new THREE.Object3D();
        tip.position.y = referenceLength;
        tip.add(sphere);

        var branch = new THREE.Object3D();
        branch.add(cylinder);
        branch.add(tip);
        branch.tip = tip;
        branch.length = referenceLength;

        if (distanceFromTip <=2) {
            _makeLeavesAround(branch.tip, _r.randomInt(_options.LEAF_DENSITY*2, _options.LEAF_DENSITY*3), _options.LEAF_COLS, _options.LEAF_SIZE, 0, 0, _options.LEAF_W);
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

        for (i = 0; i < numLeaves; i++) {

            var leaf_col = _r.randomFrom(colors);

            var newLeaf = _buildLeaf(leaf_col, leafRadius, leafWidth);

           
            newLeaf.position.y += _r.random(0, 2) + yAdjust;
            newLeaf.position.x += _r.randomSign(_r.random(0.75) + rAdjust);
            newLeaf.position.z += _r.randomSign(_r.random(0.75) + rAdjust);


            newLeaf.rotation.x = _r.random(-Math.PI/2,Math.PI);
            newLeaf.rotation.y = _r.random(-Math.PI/2,Math.PI);
            newLeaf.rotation.z = _r.random(-Math.PI/2,Math.PI);

            obj3d.rotation.y += Math.PI*2/numLeaves;

            obj3d.add(newLeaf);
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
    function _buildTree(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad) {

        var fanRads = _de2ra(_options.ANGLE_MIN + _r.random(_options.ANGLE_MAX - _options.ANGLE_MIN));
        // Don't start fanning out too low in the tree.
        if (height < 2) {
            fanRads = fanRads / 4;
        }

        var root = _buildBranch(branchLength, depth, height, fullTreeDepth, _options.BRANCH_R_MIN, maxBranchRad);

        for (var i = 0; i < treeData.length; i++) {
            var newBranch = _buildTree(treeData[i], branchLength * _options.LENGTH_MULT, _depthOfArray(treeData[i]), height + 1, fullTreeDepth, maxBranchRad);
            newBranch.rotation.x = root.rotation.x + _r.random(-fanRads/2, fanRads/2);
            newBranch.rotation.z = root.rotation.z + _r.random(-fanRads/2, fanRads/2);

            // Position this subtree somewhere along the parent branch if such exists.
            //newBranch.position.y = (height == 0) ? 0 : -Math.random() * (branchLength / 3);

            root.tip.add(newBranch);
        }

        return root;

    }

    /**
     * Add roots to the tree
     * --------------------------
     * @params as per _buildTree
     */
    function _treeWithRoots(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad) {
        
        var body = _buildTree(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad);
        
        var numRoots = _r.randomInt(3,10);  
        var startRot = _r.random(Math.PI*2);
        var rootColInt = _c.parseHex(_options.COLOR_BTM);

        //console.log(numRoots+" roots\n");
        for(var i=0; i<numRoots; i++){

            var rootRad = _r.random(maxBranchRad*0.3,maxBranchRad*0.7);
            var rootLength = _r.random(branchLength*0.05, branchLength*0.25);

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
            //cone.rotation.y = i*(Math.PI*2/numRoots);
            newRoot.rotation.y = startRot + i*(Math.PI*2/numRoots);

            //console.log("root "+numRoots+", "+newRoot.rotation.y);
            //newRoot.position.y = 0.7;
            
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

        return _treeWithRoots(data, _options.BRANCH_L, _depthOfArray(data), 0, _depthOfArray(data), _options.BRANCH_R_MAX);
    };

    function _setParameters(options){
        _o = this.options = options;
    }


    function _initOptions(opts){
        var maxRad = _pickRadius();
        var nightMode = Math.random()>0.7;

        // The bottom of the tree is a random dark colour and the top is a variation on same
        var top_color = _c.randomHex();
        //var bottom_color = nightMode ? _c.brightenByAmt(_c.randomDark(), _r.random(0,15)) : _c.brightenByAmt(_c.randomDark(), _r.random(15,45));

        // Leaves on the trees could be any color of the rainbow!
        // We keep the number of leaf colors down so we don't run out of colors.
        var leafBaseColor = nightMode ? _c.brightenByAmt(_c.randomHex(), -60) : _c.variationsOn(_c.randomHex(), 80);
        var leafColors = [];
        for (i = 0; i < 8; i++){
            leafColors.push(_c.variationsOn(leafBaseColor, 30));
        }

        var options = {
            RAINBOW: false,
            NIGHT_MODE: nightMode,
            BRANCH_R_MAX: maxRad,
            BRANCH_R_MIN: maxRad * _r.random(0.03),
            BRANCH_L: Math.max(maxRad*10,_r.random(4, 8)), 
            BRANCH_P: _r.random(0.72, 0.77),
            CHANCE_DECAY: _pickDecay(),
            LENGTH_MULT: _r.random(0.85, 0.95),
            ANGLE_MIN: _r.random(15, 45), 
            ANGLE_MAX: _r.random(60, 120), 
            COLOR_TOP: top_color,
            COLOR_BTM: _c.brightenByAmt(top_color, -180),
            LEAF_COLS: leafColors, 
            LEAF_SIZE: _pickLeafSize(),
            LEAF_DENSITY: _r.randomInt(24),
            LEAF_W: _r.random(0.7,1),
            MAX_DEPTH: 12, 
            MAX_BRANCHES_TOTAL: 999, 
            MAX_BRANCHES_PER_NODE:  _r.randomInt(3, 4)
        };

        for(var opt in opts ){
            if(options[opt] !== undefined){
                options[opt] = opts[opt];
            }   
        }

        return options;
    }
}

module.exports = DeciduousTrees;
