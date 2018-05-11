function ForestGenerator() {
    /*
      
      
    n o d e    v e r s i o n
           of threejs tree generator

           by Sarah Imrisek in 2018

    */

    var _this = this;

    var fs = require('fs');
    var path = require('path');
    var PNG = require('pngjs').PNG;
    var THREE = require('three');
    var omggif = require('omggif');
    var perlin = require('perlin-noise');
    var Colors = require('./Colors.js');
    var SoftwareRenderer = require('three-software-renderer');

    config = require(path.join(__dirname, '../config.js'));

    var colorHelper = new Colors();

    var _tree;
    var _filename;
    var _palette = [];


    var BRANCH_LENGTH = 2 + Math.random() * 5;
    var BRANCH_RAD_MAX = _pickRadius();
    var BRANCH_RAD_MIN = BRANCH_RAD_MAX * (Math.random() * 0.03);
    var LENGTH_MULT = 0.85 + Math.random() * 0.1;
    var MAX_BRANCHES_PER_NODE = Math.floor(2 + Math.random() * 3);
    var MAX_BRANCHES_TOTAL = 7777;
    var BASE_BRANCH_CHANCE = 0.7 + Math.random() * 0.11;
    var CHANCE_DECAY = Math.random() * 0.07 - 0.01;
    var MAX_DEPTH = 12;
    var ANGLE_MIN = 30;
    var ANGLE_MAX = 60 + Math.random() * 60;

    var LEAF_SIZE = _pickLeafSize();
    var LEAF_DENSITY = Math.floor(Math.random() * 20);

    //var NUM_FRAMES = 100;
    var NUM_FRAMES = 5;

    var NUM_TREES = 40 + Math.floor(Math.random() * 30);

    var COLOR_BTM, COLOR_TOP, SKY_COL, GRND_COL, LEAF_BASE_COL, TREELEAF_COLS, GRNDLEAF_COLS;

    _initColors();

    var _noise = perlin.generatePerlinNoise(480, 480);


    var scene,
        camera,
        renderer,
        controls;

    scene = new THREE.Scene();

    var _data = _randomTreeData();
    while (_data.length == 0) {
        _data = _randomTreeData();
    }

    var sceneWidth, sceneHeight, pixelRatio;
    sceneWidth = 800;
    sceneHeight = 800;
    pixelRatio = 1;


    camera = new THREE.PerspectiveCamera(50, sceneWidth / sceneHeight, 1, 1000);
    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = -30;

    var aLittleHigherPos = scene.position;
    aLittleHigherPos.y = 5;
    camera.lookAt(aLittleHigherPos);

    renderer = new SoftwareRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
    });

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(sceneWidth, sceneHeight);

    var ambientLight = new THREE.AmbientLight('#FFFFFF');
    scene.add(ambientLight);


    var branches = [];
    var tipPositions = [];


    /**
     * What radius should we use for building the base of the trees?
     * --------------------------------------------------------------
     * @return {Number}
     */
    function _pickRadius() {
        var sizeRange = Math.random() * 3;

        if (sizeRange < 0.6) {
            return 0.1 + Math.random() * 0.4;
        } else if (sizeRange < 2) {
            return 0.4 + Math.random() * 0.5;
        } else if (sizeRange < 2.7) {
            return 0.6 + Math.random() * 0.4;
        } else {
            return 0.8 + Math.random() * 0.5;
        }
    }

    /**
     * What radius should we use for creating the tree leaves?
     * ---------------------------------------------------------
     * @return {Number} 
     */
    function _pickLeafSize() {
        var sizeRange = Math.random() * 3;
        if (sizeRange < 1) {
            return 0.15 + Math.random() * 0.4;
        } else if (sizeRange < 2.2) {
            return 0.3 + Math.random() * 0.4;
        } else if (sizeRange < 2.7) {
            return 0.6 + Math.random() * 0.4;
        } else {
            return 0.8 + Math.random() * 0.6;
        }

    }

    /**
     * Pick the colors that will form the basic palette for the scene.
     * ---------------------------------------------------------------------
     * @return {void} 
     */
    function _initColors() {

        var i;

        // The bottom of the tree is a random dark color. 
        COLOR_BTM = colorHelper.brightenByAmt(colorHelper.randomDark(), 50);
        // The top is a brighter color not too far away from the bottom col.
        COLOR_TOP = colorHelper.variationsOn(COLOR_BTM, 180);
        
        // The sky and ground are a light blue and a muddy green, randomly permuted
        SKY_COL = colorHelper.variationsOn("#d4e9ff", 150);
        GRND_COL = colorHelper.variationsOn("#657753", 150);

        // Leaves on the trees could be any color of the rainbow!
        // We keep the number of leaf colors down so we don't run out of colors.
        LEAF_BASE_COL = colorHelper.variationsOn(colorHelper.randomHex(), 80);
        TREELEAF_COLS = [];
        for (i = 0; i < 8; i++) {
            TREELEAF_COLS.push(colorHelper.variationsOn(LEAF_BASE_COL, 30));
        }
        // There are leaves on the ground too.  They match the ground.
        GRNDLEAF_COLS = [];
        for (i = 0; i < 12; i++) {
            GRNDLEAF_COLS.push(colorHelper.variationsOn(GRND_COL, 30));
        }

    }

    /**
     * We need to pick 256 colors in the scene to use for the GIF.
     * -------------------------------------------------------------------
     * @param  {Array} pal  - an array of starting hex colors to use
     * 
     * @return {Array}      - the completed array of 256 colors
     */
    function _makePaletteFromScene(pal) {

        // these are the pixels we're going to work with
        var firstsnap = renderer.render(scene, camera);

        var eightbitbuffer = _convertRGBAto8bit(firstsnap.data, pal);

        // If we didn't need all 256 colors, fine, just fill up the rest so the GIFmaker doesn't break.
        while (pal.length < 256) {
            pal.push(Math.floor(Math.random() * 0xFFFFFF));
        }

        return pal;
    }
 

    /**
     * Render and save to file an animated GIF of the scene
     * -----------------------------------------------------
     * @return {void}
     */
    _this.makeGIF = function() {

        var gifData = [];

        _palette = _makePaletteFromScene(_palette);

        // Arbitrarily step into the scene so they don't all start from the same position
        _tree.position.z -= Math.random() * 10;

        var gifBuffer = new Buffer(sceneWidth * sceneHeight * NUM_FRAMES); 
        var gif = new omggif.GifWriter(gifBuffer, sceneWidth, sceneHeight, {
            palette: _palette,
            loop: 0
        });
        var y_axis = new THREE.Vector3(0, 1, 0);
        var startingNoise = Math.floor(Math.random() * _noise.length / 2);

        for (var i = 0; i < NUM_FRAMES; i++) {

            // output progress tracked in the console soothes my anxiety!
            console.log(i);

            // simulate walking through the forest by steadily moving forward,
            // and rotating the scene with perlin noise.
            _tree.position.z -= 0.5;
            var wobble = (_noise[i + startingNoise] - 0.5) / 150;
            _tree.rotation.y += wobble;

            var pixels = renderer.render(scene, camera);
            var frameData = _convertRGBAto8bit(pixels.data, _palette);
            gif.addFrame(0, 0, pixels.width, pixels.height, frameData);

        }

        var id = _randomId();
        fs.writeFileSync('./images/' + _filename + '.gif', gifBuffer.slice(0, gif.end()));
        console.log("wrote " + _filename + ".gif");

    };

    /**
     * Saves a png of the scene to file. For testing.
     * -------------------------------------------------
     * @param  {Array of ints} pixelData   -- rgba buffer
     * @param  {int} width
     * @param  {int} height
     * 
     * @return {void}    
     */
    function _savePNG(pixelData, width, height) {
        var png = new PNG({
            width: width,
            height: height,
            filterType: -1
        });

        for (var i = 0; i < pixelData.length; i++) {
            png.data[i] = pixelData[i];
        }
        png.pack().pipe(fs.createWriteStream('./images/' + _filename + '.png'));
    }

    /**
     * For unique filenames.
     * ---------------------------------
     * @return {int}
     */
    function _randomId() {
        return Math.floor(Math.random() * 99999);
    }


    /**
     * Reduce the RGBA colors in this scene to 256 8bit colors.  This is done by reading them
     * in order and adding them to our palette until we reach the limit, and from that point on,
     * converting any other colors to the closest ones we already have.
     * Not an ideal method cause what if there are nice new colors at the bottom of the frame?
     * We won't get them.  Wouldn't it be nice to figure out how to dither this scene?
     * --------------------------------------------------------------------------------------------
     * @param  {Array of ints} rgbaBuffer
     * @param  {Array of ints} palette    -- startubg list of hex colors
     * 
     * @return {Array of hex ints}        -- the final list of hex colors         
     */
    function _convertRGBAto8bit(rgbaBuffer, palette) {

        var outputBuffer = new Uint8Array(rgbaBuffer.length / 4);

        var bgBuffer = [];

        // We're going to add some stripes for a very primitive gradient where the sky meets the ground.
        var skyColInt = colorHelper.parseHex(SKY_COL);
        var grndColInt = colorHelper.parseHex(GRND_COL);
        var blend0 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GRND_COL, 0.9, 0.1));
        var blend1 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GRND_COL, 0.7, 0.3));
        var blend2 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GRND_COL, 0.5, 0.5));
        var blend3 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GRND_COL, 0.3, 0.7));


        for (var i = 0; i < rgbaBuffer.length; i += 4) {
            var color = (rgbaBuffer[i] << 16) + (rgbaBuffer[i + 1] << 8) + rgbaBuffer[i + 2];

            // buffer.length/skyline = the line on the image where the ground begins.
            var skyline = 1.75;

            // if this pixel is transparent, let's fill in a background.
            if (rgbaBuffer[i + 3] == 0 && color == 0) {

                if (i < rgbaBuffer.length / (skyline + 0.5)) {
                    color = skyColInt;
                } else if (i < rgbaBuffer.length / (skyline + 0.1)) {
                    color = blend0;
                } else if (i < rgbaBuffer.length / (skyline)) {
                    color = blend1;
                } else if (i < rgbaBuffer.length / (skyline - 0.1)) {
                    color = blend2;
                } else if (i < rgbaBuffer.length / (skyline - 0.15)) {
                    color = blend3;
                } else {
                    color = grndColInt;
                }
            }

            var foundCol = false;
            for (var p = 0; p < palette.length; p++) {
                // Oh we have this color already, excellent.
                if (color == palette[p]) {
                    foundCol = true;
                    outputBuffer[i / 4] = p;
                    break;
                }
            }

            if (!foundCol && (palette.length < 256)) {
                // Don't know this color yet but there's still room to add it.
                palette.push(color);
                outputBuffer[i / 4] = palette.length - 1;

            } else if (!foundCol) { 
                // This is a new color we don't have room to add. We'll approximate it
                // to the closest color we already have in the palette.
                var lowestDiff = 0xFFFFFF*10;
                var closestCol = 0xFFFFFF;
                var closestIndex = -1;

                for (var pp = 0; pp < palette.length; pp++) {
                    var paletteInt = palette[pp];
                    var colorInt = color;
                    var colorDiff = Math.abs(colorInt - paletteInt);
                    if (colorDiff < lowestDiff) {
                        lowestDiff = colorDiff;
                        closestCol = palette[pp];
                        closestIndex = pp;
                    }
                }
                outputBuffer[i / 4] = closestIndex;
            }


        }

        return outputBuffer;
    }


    var _numBranches = 0;

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

        if (depth < MAX_DEPTH) {
            var branchChance = (BASE_BRANCH_CHANCE - Math.min(BASE_BRANCH_CHANCE, CHANCE_DECAY * depth));

            while (structure.length < MAX_BRANCHES_PER_NODE && Math.random() < branchChance) {

                if (_numBranches > MAX_BRANCHES_TOTAL) {
                    break;
                }

                var newBranch = _randomTreeData([], depth + 1);
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


    /**
     * "Leaf"
     * Make a circular mesh in the specified size and color
     * -------------------------------------------------------
     * @param  {String} leafCol     -- a hex color string
     * @param  {Number} leafSize    -- the leaf radius
     * 
     * @return {THREE.Mesh}         -- the "leaf"
     */
    function _buildLeaf(leafCol, leafSize) {

        var geometry = new THREE.CircleGeometry(leafSize, 8);
        var material = new THREE.MeshBasicMaterial({
            color: colorHelper.parseHex(leafCol)
        });

        var leaf = new THREE.Mesh(geometry, material);
        return leaf;
    }

    /**
     * "Mountain"
     * Make a circular mesh in the specified size in the same colour as the ground. 
     * --------------------------------------------------------------------------------
     * Rotate it to face the camera.
     * @param  {Number} size    -- mountain radius
     * 
     * @return {THREE.Mesh}     -- the "mountain"
     */
    function _buildMountain(size) {

        var geometry = new THREE.CircleGeometry(size, 64);
        var material = new THREE.MeshBasicMaterial({
            color: colorHelper.parseHex(GRND_COL)
        });

        var mountain = new THREE.Mesh(geometry, material);
        mountain.rotation.x = -Math.PI;
        return mountain;
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
        var length = baseLength * (1 + Math.random() * 0.4);

        // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
        var referenceLength = Math.min(length, BRANCH_LENGTH);

        var baseRadius = function(distFromTip, distFromRoot) {
            var fromBottom = minRad + ((fullTreeDepth - distFromRoot) / fullTreeDepth) * (maxRad - minRad);
            var fromTop = minRad + ((distFromTip) / fullTreeDepth) * (maxRad - minRad);
            return fromTop;
        };

        var radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
        var radiusTop = baseRadius(Math.max(0, distanceFromTip - 1), distanceFromRoot + 1);

        var cylGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 8);
        var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
        var hex;

        var propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
        var propTop = 1 - propBtm;

        var branchCol = colorHelper.mixHexCols(COLOR_BTM, COLOR_TOP, propBtm, propTop);

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
            _makeLeavesAround(branch.tip, Math.floor(LEAF_DENSITY / 2 + Math.random() * (LEAF_DENSITY / 2)), TREELEAF_COLS, LEAF_SIZE);
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
     * 
     * @return {void}                   -- The leaves will be added as children of the obj.
     */
    function _makeLeavesAround(obj3d, numLeaves, colors, leafRadius) {

        for (i = 0; i < numLeaves; i++) {

            var leaf_col = colors[Math.floor(Math.random() * colors.length)];

            var newLeaf = _buildLeaf(leaf_col, leafRadius);

            newLeaf.position.x += Math.random() * 1.5 - 0.75;
            newLeaf.position.y += Math.random() * 2;
            newLeaf.position.z += Math.random() * 1.5 - 0.75;


            newLeaf.rotation.x = Math.random() * 2 * Math.PI;
            newLeaf.rotation.y = Math.random() * 2 * Math.PI;
            newLeaf.rotation.z = Math.random() * 2 * Math.PI;

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
     * 
     * @return {THREE.Object3D}                 -- the 3D tree!
     */
    function _buildTree(treeData, branchLength, depth, height, fullTreeDepth) {

        var fanRads = _de2ra((ANGLE_MIN + (Math.random() * (ANGLE_MAX - ANGLE_MIN))));
        // Don't start fanning out too low in the tree.
        if (height < 2) {
            fanRads = fanRads / 4;
        }

        var workingRad = BRANCH_RAD_MIN + BRANCH_RAD_MAX * (0.6 + Math.random() * 0.4);
        var root = _buildBranch(branchLength, depth, height, fullTreeDepth, BRANCH_RAD_MIN, workingRad);

        for (var i = 0; i < treeData.length; i++) {
            var newBranch = _buildTree(treeData[i], branchLength * LENGTH_MULT, _depthOfArray(treeData[i]), height + 1, fullTreeDepth);
            newBranch.rotation.x = root.rotation.x + (Math.random() * fanRads) - fanRads / 2;
            newBranch.rotation.z = root.rotation.z + (Math.random() * fanRads) - fanRads / 2;

            // Position this subtree somewhere along the parent branch if such exists.
            newBranch.position.y = (height == 0) ? 0 : -Math.random() * (branchLength / 3);

            root.tip.add(newBranch);
        }

        return root;

    }

    /**
     * Build and position a bunch of trees in front of the camera to give the impression of a full surrounding forest.
     * Also some ground vegetation, why not.
     * -------------------------------------------------------------------------------------------------------------------
     * @return {void}
     */
    
    function _buildForest() {
        var i;
        // Trees
        for (i = 0; i < NUM_TREES; i++) {
            _data = [];
            while (_depthOfArray(_data) < 3) {
                _numBranches = 0;
                _data = _randomTreeData();
            }
            
            var newTree = _buildTree(_data, BRANCH_LENGTH, _depthOfArray(_data), 0, _depthOfArray(_data));

            if (i % 2 == 0) {
                // Half of the trees we want relatively close to the center
                newTree.position.x = (Math.random() * 20) * _randomSign() - _tree.position.x;
            } else {
                // and half can spread further out, with a wider spread as they are farther away.
                newTree.position.x = (1 + Math.random() * (40 + i)) * _randomSign() - _tree.position.x;
            }

            // Some clumps of vegetation around the base of the trees.
            _makeLeavesAround(newTree, Math.floor(Math.random() * 30), GRNDLEAF_COLS, _pickLeafSize());

            // put all the trees behind the first one so we can walk through them
            newTree.position.z = i * 5 + (Math.random() * 10 - 5);

            // Good to get an idea of how complicated a thing we are building so we know how anxious to 
            // get about how long it is taking to generate.
            console.log("tree " + i + " has " + _numBranches + " branches, at x " + Math.round(newTree.position.x) + "  z " + Math.round(newTree.position.z));

            _tree.add(newTree);
        }

        // Ground cover
        for (i = 0; i < NUM_TREES * 2; i++) {
            var clump = new THREE.Object3D();
            clump.position.x = Math.random() * 80 - 40;
            clump.position.z = Math.random() * 200;
            _makeLeavesAround(clump, Math.floor(Math.random() * 15), GRNDLEAF_COLS, _pickLeafSize());
            _tree.add(clump);
        }
    }

    /**
     * Build a scene with trees!  and hills!  
     * ---------------------------------------------------------------------------------------------
     * @return {void}
     */
    function _buildScene() {
        scene.remove(_tree);
        _data = [];

        while (_depthOfArray(_data) < 3) {
            _numBranches = 0;
            _data = _randomTreeData();
        }
        console.log("random tree has " + _numBranches + " branches.");

        _tree = _buildTree(_data, BRANCH_LENGTH, _depthOfArray(_data), 0, _depthOfArray(_data));
        _tree.position.x = (5 + Math.random() * 5) * _randomSign();
        _tree.position.y = -10;

        _makeLeavesAround(_tree, Math.floor(Math.random() * 30), GRNDLEAF_COLS, _pickLeafSize());

        // hey let's just throw in a whole forest.
        _buildForest();

        var numHills = Math.floor(Math.random() * 15);
        for (var i = 0; i < numHills; i++) {
            var hillSize = Math.floor(50 + Math.random() * 200);
            var hill = _buildMountain(hillSize);
            hill.position.z = 400 + i * 5;
            hill.position.x = Math.random() * 300 - 150;
            hill.position.y = Math.random() * 12 - 5 - hillSize;
            _tree.add(hill);
        }

        scene.add(_tree);   
    }

    /**
     * Positive or negative?
     * -------------------------
     * @return {int}
     */
    function _randomSign() {
        return (Math.random() > 0.5) ? 1 : -1;
    }

    /**
     * Make a scene, turn it into a gif and save it.
     * --------------------------------------------------------------------------------------------
     * @param  {int} numFrames      -- how many frames in the GIF?  (Watch your file size grow!) 
     * @param  {string} filename    -- name for the gif
     * 
     * @return {void}
     */
    _this.generateSceneGIF = function(numFrames, filename) {
        NUM_FRAMES = numFrames;
        _filename = filename;
        _buildScene();
        _this.makeGIF();
    };

}

module.exports = ForestGenerator;