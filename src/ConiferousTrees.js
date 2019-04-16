

function ConiferousTrees(options) {

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
    function _randomTreeData(structure, depth, max_d) {
        for(var i=0; i<max_d; i++){
            var substruct = [];
            for(var j=0; j< _options.MAX_BRANCHES_PER_NODE; j++){
                if(Math.random()<_options.BRANCH_P){
                    substruct.push([]);
                }
            }
            structure.push(substruct);
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
        var leaf = _m.diamondMesh(leafCol, leafSize);
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
    function _buildBranch(baseLength, distanceFromTip, distanceFromRoot, fullTreeDepth, minRad, maxRad, overridecolor) {

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

        var branchCol = _rainbow ? _c.randomHex() : _c.mixHexCols(_options.COLOR_BTM, _options.COLOR_TOP, propBtm, propTop);
        // TESTING ONLY:
        //var branchCol = overridecolor;

        for (i = 0; i < cylGeom.faces.length; i += 2) {
            hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
            cylGeom.faces[i].color.setHex(hex);
            cylGeom.faces[i + 1].color.setHex(hex);
        }

        for (i = 0; i < sphGeom.faces.length; i += 2) {
            hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
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
            _makeLeavesAround(branch.tip, _options.LEAF_DENSITY, _options.LEAF_COLS, _options.LEAF_SIZE, 0, 0, _options.LEAF_W);
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
        var testcolor = (depth==0) ? "#FF0000": ((depth==1) ? "#0000FF" : "#00FF00");
        var root = _buildBranch(0.1, fullTreeDepth, height, fullTreeDepth, minBranchRad, maxBranchRad, testcolor);
        var workingRoot = root;

        if(depth == 1){
            //root.tip.rotation.x = (depth==0 ? _de2ra(145) : _de2ra(-115));
            root.tip.rotation.x =  _de2ra(125);
        } else if (depth > 1){
            root.tip.rotation.x =  _de2ra(65);
        }

        //var minBend = _de2ra(corePiece ? _options.ANGLE_MIN/6 : _options.ANGLE_MIN);
        //var maxBend = _de2ra(corePiece ? _options.ANGLE_MAX/6 : _options.ANGLE_MAX);


        var minBend = _de2ra(corePiece ? 180 + _options.ANGLE_MIN/2 : _options.ANGLE_MIN/2);
        var maxBend = _de2ra(corePiece ? 180 + _options.ANGLE_MAX/2 : _options.ANGLE_MAX/2);

        var newBranchL = branchLength * _options.LENGTH_MULT;

        console.log("     d     "+depth+",     ftd "+fullTreeDepth);
        //console.log("     bl    "+branchLength);
        //console.log("     r     "+maxBranchRad);
        //console.log(workingRoot.tip);
        
        var workingDepth = (depth<=1 ? fullTreeDepth : Math.min(4,fullTreeDepth));
        for (var i = 0; i < workingDepth; i++) {

            console.log("-------------trunkpiece "+i);

            if (i > 0 && depth>0){
                testcolor = "#FFFF00";
            }
            var trunkBranch = _buildBranch(branchLength, treeData.length-i, i, workingDepth, minBranchRad*((treeData.length -i)/treeData.length), maxBranchRad*((treeData.length -i)/treeData.length), testcolor);
            trunkBranch.rotation.x = depth==0 ? _r.random(-0.1,0.1) : (depth > 1 && i > 1)? -_r.random(-minBend/10,-maxBend/10) :  _r.random(-minBend/10,-maxBend/10);
            //trunkBranch.position.x = workingRoot.tip.position.x;
            //trunkBranch.position.y = workingRoot.tip.position.y;
            //trunkBranch.rotation.x = root.rotation.x + (corePiece ? 0 : -0.3);

            
            //branchNode.position.x = workingRoot.tip.position.x;
            //branchNode.position.y = workingRoot.tip.position.y;
            workingRoot.tip.add(trunkBranch);

            baseTwist = _r.random(Math.PI*2);

            if(i>0 && depth < 2){
                for (var j = 0; j < treeData[i].length; j++) {

                    if(Math.random()>1/Math.log(depth+3)){
                        continue;
                    }
                    console.log("---------=== branch "+j);
                    newBranchL = branchLength*((treeData.length -i)/treeData.length)/3;

                    //newBranchL*(fullTreeDepth-i)
                    var newBranch = _buildTree(treeData, newBranchL, depth+1, i, fullTreeDepth-1, maxBranchRad*((treeData.length -i)/treeData.length)/3, false);
                    //var newBranch = _buildBranch(newBranchL, 1, i, fullTreeDepth, minBranchRad*((treeData.length -i)/treeData.length), maxBranchRad*((treeData.length -i)/treeData.length));
                    //newBranch.rotation.x = _de2ra(90+(treeData.length-i)*3);
                    //newBranch.position.x = branchNode.position.x;
                    //newBranch.position.y = branchNode.position.y;
                    //newBranch.rotation.z = -_r.random(minBend, maxBend);
                    var branchNode = new THREE.Object3D();
                    branchNode.rotation.y = baseTwist + j*Math.PI*2/(treeData[i].length);

                    newBranch.position.y = _r.random(-branchLength/3,branchLength/3);
                    branchNode.add(newBranch);
                    workingRoot.tip.add(branchNode);

                    //console.log("     --------* "+newBranchL+",  r "+branchNode.rotation.y);
                    
                    _numBranches++;

                }    
            }           
            

            workingRoot = trunkBranch;

        }

        
        return root;

    }

    /**
     * Add roots to the tree
     * --------------------------
     * @params as per _buildTree
     */
    function _treeWithRoots(treeData, branchLength, depth, height, fullTreeDepth, maxBranchRad) {

        
        var body = _buildTree(treeData, branchLength, 0, height, fullTreeDepth, maxBranchRad, true);
        
        var numRoots = _r.randomInt(3,10);  
        var startRot = _r.random(Math.PI*2);
        var rootColInt = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(_options.COLOR_BTM);

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
        data = _randomTreeData([],0,_options.MAX_DEPTH); 
        
        
        //console.trace(data);

        return _treeWithRoots(data, _options.BRANCH_L,  data.length, 0, data.length, _options.BRANCH_R_MAX);
    };

    function _setParameters(options){
        _o = this.options = options;
    }


    function _initOptions(opts){
        var maxRad = 5*_pickRadius();

        // The bottom of the tree is a random dark colour and the top is a variation on same
        
        var bottom_color = _c.randomHex();

        // Leaves on the trees could be any color of the rainbow!
        // We keep the number of leaf colors down so we don't run out of colors.
        var leafBaseColor = opts.NIGHT_MODE ? _c.brightenByAmt(_c.randomHex(), -60) : _c.variationsOn(_c.randomHex(), 80);
        var leafColors = [];
        for (i = 0; i < 8; i++){
            leafColors.push(_c.variationsOn(leafBaseColor, 30));
        }

        var options = {
            RAINBOW: false,
            NIGHT_MODE: false,
            BRANCH_R_MAX: maxRad,
            BRANCH_R_MIN: maxRad * _r.random(0.03),
            TRUNK_R_MAX: _r.random(5,25),
            TRUNK_R_MIN: _r.random(2),
            BRANCH_L: _r.random(3, 7), 
            BRANCH_P: _r.random(0.85, 0.95),
            CHANCE_DECAY: _pickDecay(),
            LENGTH_MULT: _r.random(0.85, 0.95),
            ANGLE_MIN: _r.random(100, 110), 
            ANGLE_MAX: _r.random(120, 135), 
            COLOR_BTM: bottom_color, 
            COLOR_TOP: _c.variationsOn(bottom_color, 180), 
            LEAF_COLS: leafColors, 
            LEAF_SIZE: _pickLeafSize(),
            LEAF_DENSITY: _r.randomInt(24),
            LEAF_W: _r.random(0.1,0.2),
            MAX_DEPTH: _r.random(8,20), 
            MAX_BRANCHES_TOTAL: 9999, 
            MAX_BRANCHES_PER_NODE:  _r.randomInt(3, 6),
            LEAF_DENSITY: _r.randomInt(24)
        };

        for(var opt in opts ){
            if(options[opt] !== undefined){
                options[opt] = opts[opt];
            }   
        }

        console.log("decay "+options.CHANCE_DECAY+"\nmax depth "+options.MAX_DEPTH+"\nbranches per node "+options.MAX_BRANCHES_PER_NODE);

        return options;
    };
}

module.exports = ConiferousTrees;
