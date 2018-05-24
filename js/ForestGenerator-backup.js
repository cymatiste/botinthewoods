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

    var _forest;
    var _filename;
    var _palette = [];

    var BRANCH_LENGTH = _random(2, 8);
    var BRANCH_RAD_MAX = _pickRadius();
    var BRANCH_RAD_MIN = BRANCH_RAD_MAX * _random(0.03);
    var LENGTH_MULT = _random(0.85, 0.95);
    var MAX_BRANCHES_PER_NODE = _randomInt(2, 5);
    var MAX_BRANCHES_TOTAL = 3333;
    var BASE_BRANCH_CHANCE = _random(0.72, 0.77);
    var CHANCE_DECAY = _pickDecay();
    var MAX_DEPTH = 12;
    var ANGLE_MIN = _random(15, 45);
    var ANGLE_MAX = _random(60, 120);

    var LEAF_SIZE = _pickLeafSize();
    var LEAF_DENSITY = _randomInt(24);
    var TREELEAF_WIDTH = _random(0.7,1);
    var GROUNDLEAF_WIDTH = _random(0.3,0.8);

    var NIGHT_MODE = (Math.random() < 0.25);
    var PATH_MODE = (Math.random() < 0.25);

    var NUM_FRAMES = 100;
    
    var NUM_TREES = _randomInt(100, 250);

    var COLOR_BTM, COLOR_TOP, SKY_COL, GROUND_COL, LEAF_BASE_COL, TREELEAF_COLS, GROUND_COLS, VEG_COLS, STONE_COLS;

    _initColors();

    console.log("BRANCH_LENGTH: "+BRANCH_LENGTH+"\n BRANCH_RAD_MAX: "+BRANCH_RAD_MAX+"\n BRANCH_RAD_MIN: "+BRANCH_RAD_MIN+"\n LENGTH_MULT: "+LENGTH_MULT+"\n MAX_BRANCHES_PER_NODE: "+MAX_BRANCHES_PER_NODE+"\n MAX_BRANCHES_TOTAL: "+MAX_BRANCHES_TOTAL+"\n BASE_BRANCH_CHANCE: "+BASE_BRANCH_CHANCE+"\n CHANCE_DECAY: "+CHANCE_DECAY+"\n MAX_DEPTH: "+MAX_DEPTH+"\n ANGLE_MIN: "+ANGLE_MIN+"\n ANGLE_MAX: "+ANGLE_MAX+"\n LEAF_SIZE: "+LEAF_SIZE+"\n LEAF_DENSITY: "+LEAF_DENSITY+"\n N I G H T ? "+NIGHT_MODE+"\n COLOR_BTM: "+COLOR_BTM+"\n COLOR_TOP: "+COLOR_TOP);

    var _noise = perlin.generatePerlinNoise(1000, 1000);
    var _startingNoise = _randomInt(_noise.length / 2);


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
    sceneWidth = 640;
    sceneHeight = 600;
   
    // When generating twitter headers
    //sceneWidth = 1800;
    //sceneHeight = 1000;

    pixelRatio = 1;


    camera = new THREE.PerspectiveCamera(50, sceneWidth / sceneHeight, 1, 1500);
    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = -20;

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
        var sizeRange = Math.random();

        if (sizeRange < 0.2) {
            return _random(0.1, 0.3);
        } else if (sizeRange < 0.5) {
            return _random(0.4, 0.9);
        } else if (sizeRange < 0.95) {
            return _random(1, 1.4);
        } else {
            return _random(1.5, 2.8);
        }
    }

    /**
     * How less likely do branches become at each node?
     * ----------------------------------------------------
     * @return {Number} 0-1
     */
    function _pickDecay(){
        var decayRange = Math.random();
        if (decayRange < 0.15){
            return _random(0, 0.035);
        } else if (decayRange < 0.8){
            return _random(0.035, 0.055);
        } else {
            return _random(0.055, 0.07);
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
            return _random(0.15, 0.4);
        } else if (sizeRange < 0.7) {
            return _random(0.4, 0.8);
        } else if (sizeRange < 0.9) {
            return _random(0.8, 1);
        } else {
            return _random(1, 1.4);
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
        COLOR_BTM = colorHelper.randomDark();
        if(!NIGHT_MODE){
            COLOR_BTM = colorHelper.brightenByAmt(COLOR_BTM, _random(30,80));
        }
        // The top is a brighter color not too far away from the bottom col.
        COLOR_TOP = colorHelper.variationsOn(COLOR_BTM, 180);
        
        // The sky and ground are a pastel blue and a muddy green, randomly permuted
        SKY_COL = NIGHT_MODE ? colorHelper.variationsOn("#4d6876", 120) : colorHelper.variationsOn("#bdeff1", 150);
        GROUND_COL = NIGHT_MODE ? colorHelper.variationsOn("#40523c", 80) : colorHelper.variationsOn("#78836e", 150);

        // Leaves on the trees could be any color of the rainbow!
        // We keep the number of leaf colors down so we don't run out of colors.
        LEAF_BASE_COL = NIGHT_MODE ? colorHelper.brightenByAmt(colorHelper.randomHex(), -60) : colorHelper.variationsOn(colorHelper.randomHex(), 80);
        
        // There are leaves on the ground too.  They match the ground, which varies slightly.
        // And flowers!  Which could be any colour.
        TREELEAF_COLS = [];
        GROUND_COLS = [];
        VEG_COLS = [];
        FLOWER_COLS = [];
        STONE_COLS = [];

        var vegBase = NIGHT_MODE ? GROUND_COL : colorHelper.brightenByAmt(GROUND_COL,_random(-10,10));
        
        var stoneGrey = colorHelper.greyHex(NIGHT_MODE?_randomInt(20,60):_randomInt(90,130));
        var stoneBase = colorHelper.mixHexCols(stoneGrey,GROUND_COL,0.7,0.3);
        stoneBase = colorHelper.mixHexCols(stoneBase,SKY_COL,0.8,0.2);
        // just one colour for the path actually, it's too sparkly otherwise
        STONE_COLS[0] = stoneBase;
 
        for (i = 0; i < 8; i++){
            TREELEAF_COLS.push(colorHelper.variationsOn(LEAF_BASE_COL, 30));
            GROUND_COLS.push(colorHelper.variationsOn(GROUND_COL, 15));
            VEG_COLS.push(colorHelper.variationsOn(vegBase, 30));
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
            pal.push(colorHelper.parseHex(colorHelper.variationsOn(GROUND_COL),15));
        }

        return pal;
    }

    function _stonePath(){
        
        var path = new THREE.Object3D();
        var stepSize = 0.5;
        var currentPoint = new THREE.Vector3(0,0,-30);
        var wending = _random(1,3);
        var clusterSpread = _random(1,5);
            
        for(var i=0; i<400/stepSize; i++){

            var numStonesInCluster = _random(10,20);
            var clusterRadius = _random(1,3);
            var minSize = 0.07, maxSize = 0.3;
        
            var cluster = new THREE.Object3D();    
            for(var s=0; s<numStonesInCluster; s++){

                var stoneX = _random(-clusterRadius, clusterRadius);
                
                var stoneSize = minSize + maxSize*((clusterRadius - Math.abs(stoneX))/clusterRadius);
                var stone = _buildStone(STONE_COLS[0], stoneSize);
                stone.position.x = stoneX;
                stone.position.z = _random(-clusterRadius, clusterRadius);

                cluster.add(stone);
            }
            
            cluster.position.x = clusterSpread*_noise[Math.floor(i/wending)] - clusterSpread/2;
            cluster.position.z = currentPoint.z + i*stepSize;
            //clusterWrapper.rotation.y = _perlinRotation(i);
            //console.log("stones at z "+cluster.position.z);
           
            path.add(cluster);
        }
        //path.position.y = 0.5;
        return path;
    }
 

    /**
     * Render and save to file an animated GIF of the scene
     * -----------------------------------------------------
     * @return {string} the filename saved.
     */
    _this.makeGIF = function() {

        var gifData = [];

        _palette = _makePaletteFromScene(_palette);

        var gifBuffer = new Buffer(sceneWidth * sceneHeight * NUM_FRAMES); 
        var gif = new omggif.GifWriter(gifBuffer, sceneWidth, sceneHeight, {
            palette: _palette,
            loop: 0
        });
        var y_axis = new THREE.Vector3(0, 1, 0);
        

        for (var i = 0; i < NUM_FRAMES; i++) {

            // output progress tracked in the console soothes my anxiety!
            console.log(i);

            // simulate walking through the forest by steadily moving forward,
            // and rotating the scene with perlin noise.
            _forest.position.z -= 0.5;
            var wobble = _perlinRotation(i);
            _forest.rotation.y += wobble;

            var pixels = renderer.render(scene, camera);
            var frameData = _convertRGBAto8bit(pixels.data, _palette);
            gif.addFrame(0, 0, pixels.width, pixels.height, frameData);

        }

        var id = _randomInt(0,9999999);
        fs.writeFileSync('./images/' + _filename + '.gif', gifBuffer.slice(0, gif.end()));
        console.log("wrote " + _filename + ".gif");

        return _filename;
    };

    function _perlinRotation(index){
        return (_noise[index + _startingNoise] - 0.5) / 150;
    }

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
        var grndColInt = colorHelper.parseHex(GROUND_COL);
        var blend0 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GROUND_COL, 0.9, 0.1));
        var blend1 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GROUND_COL, 0.7, 0.3));
        var blend2 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GROUND_COL, 0.5, 0.5));
        var blend3 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL, GROUND_COL, 0.3, 0.7));


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
     * "Mountain"
     * Make a circular mesh in the specified size in the same colour as the ground. 
     * --------------------------------------------------------------------------------
     * Rotate it to face the camera.
     * @param  {Number} size    -- mountain radius
     * 
     * @return {THREE.Mesh}     -- the "mountain"
     */
    function _buildHill(size,col) {

        var geometry = new THREE.CircleGeometry(size, 64);
        var material = new THREE.MeshBasicMaterial({
            color: colorHelper.parseHex(col)
        });

        var hill = new THREE.Mesh(geometry, material);
        hill.rotation.x = -Math.PI;
        return hill;
    }

    function _bushColors(){
        var cols = [];
        var bushBase = colorHelper.mixHexCols(colorHelper.variationsOn(GROUND_COL, 75),COLOR_BTM,0.8,0.2);
        for (i = 0; i < 4; i++){
            cols.push(colorHelper.variationsOn(bushBase, 20));
        }
        return cols;
    }

    function _bush(height,width,colors,leafSize){
       
       var bush = new THREE.Object3D();
       for (var i = 0; i < height*2; i++) {
            var clump = new THREE.Object3D();
            _makeLeavesAround(clump, _randomInt(20, 40), colors, leafSize, 0, 0, leafSize);
            clump.position.y = i*0.2;
            clump.position.x = _random(-width/2,width/2);
            clump.position.z = _random(-width/2,width/2);
            bush.add(clump);
        } 

        bush.position.y = -0.5;
        bush.scale.x = bush.scale.y = bush.scale.z = _random(1,1.5);
        return bush;
    }

    function _buildBushes(){
        var bushHeight = BRANCH_LENGTH;
        var bushWidth = _randomInt(2,6);
        var numBushes = _randomInt(0,NUM_TREES/3);
        var bushColors = _bushColors();
        var leafSize = _random(LEAF_SIZE/2,LEAF_SIZE);
        var leafWidth = _random(0.7,1);
        for (var i = 0; i < numBushes; i++) {
            console.log("bush "+i);
            var newBush = _bush(_random(bushHeight*0.5,bushHeight*1.2),bushWidth,bushColors,leafSize, leafWidth);
            newBush.position.z = _random(- 20, 150);
            newBush.position.x = _randomSign(_random(0,40 + i) + (PATH_MODE ? _random(1,2) : 0));
            _forest.add(newBush);
        }
    }

    function _flowerColors(){
        var cols = [];
        var flowerBase = colorHelper.randomHex();
        if(NIGHT_MODE){
            flowerBase = colorHelper.brightenByAmt(flowerBase, -100);
        }
        for (var i = 0; i < 4; i++){
            cols.push(colorHelper.variationsOn(flowerBase, 50));
        }
        return cols;
    }

    function _flowers(){   
        var flowerCols = _flowerColors();
        var numFlowers = _randomInt(50, 350);
        var newPath = new THREE.Object3D();
        var petalNum = _randomInt(3,8); 
        var basePetalSize = _random(0.6, 1);

        var startZ = _random(0, 30);
        var zSpread = _random(0, 20);
        var startX = _random(-20, 20);
        var xSpread = 40;

        for(var i=0; i<numFlowers; i++){

            var petalSize = basePetalSize*_random(0.2, 0.5);
            var variedCol = _randomFrom(flowerCols);
            
            var flowerCol = variedCol;
            var petalAngle = Math.PI*_random(1.25, 1.5);
            var f = new _flower(petalNum, flowerCol, petalSize, petalAngle);
            f.position.z = startZ + i*_random(-zSpread/3, zSpread*(2/3));
            f.position.x = startX + _random(-xSpread/2, xSpread/2);
            f.position.y = _random(0, 0.3);

            f.rotation.x += _random(- 0.3, 0.3);
            f.rotation.z += _random(- 0.3, 0.3);
            f.scale.x = f.scale.y = f.scale.z = _random(0.5, 1);
            //f.position.y = 5;
            newPath.add(f);
        }
        console.log("@@@, "+numFlowers+" flowers, "+petalNum+" petals");
        return newPath;
    }



    function _flower(numPetals, col, petalSize, petalAngle){
        //console.log("flower: "+numPetals+", "+col+", "+petalSize);
        var flower = new THREE.Object3D();

        for(var i=0; i<numPetals; i++){

            var pivot = new THREE.Object3D();

            var geometry = new THREE.CircleGeometry(petalSize, 16);
            var material = new THREE.MeshBasicMaterial({
                color: col
            });
            
            var petal = new THREE.Mesh(geometry, material);
            
            petal.rotation.x = petalAngle;

            petal.position.z = petalSize/1.5;
            petal.scale.x = 2/numPetals;
            pivot.add(petal);
            pivot.position.y = 1.1;

            //petal.rotation.z = _de2ra(30);
            
            
            pivot.rotation.y = i*_de2ra(360/numPetals);
            
            flower.add(pivot);
        }
        
        return flower;
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
        var length = baseLength * _random(1, 1.4);

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
            _makeLeavesAround(branch.tip, _randomInt(LEAF_DENSITY*2, LEAF_DENSITY*3), TREELEAF_COLS, LEAF_SIZE, 0, 0, TREELEAF_WIDTH);
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

            var leaf_col = _randomFrom(colors);

            var newLeaf = _buildLeaf(leaf_col, leafRadius, leafWidth);

           
            newLeaf.position.y += _random(0, 2) + yAdjust;
            newLeaf.position.x += _randomSign(_random(0.75) + rAdjust);
            newLeaf.position.z += _randomSign(_random(0.75) + rAdjust);


            newLeaf.rotation.x = _random(-Math.PI/2,Math.PI);
            newLeaf.rotation.y = _random(-Math.PI/2,Math.PI);
            newLeaf.rotation.z = _random(-Math.PI/2,Math.PI);

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

        var fanRads = _de2ra(ANGLE_MIN + _random(ANGLE_MAX - ANGLE_MIN));
        // Don't start fanning out too low in the tree.
        if (height < 2) {
            fanRads = fanRads / 4;
        }

        var root = _buildBranch(branchLength, depth, height, fullTreeDepth, BRANCH_RAD_MIN, maxBranchRad);

        for (var i = 0; i < treeData.length; i++) {
            var newBranch = _buildTree(treeData[i], branchLength * LENGTH_MULT, _depthOfArray(treeData[i]), height + 1, fullTreeDepth, maxBranchRad);
            newBranch.rotation.x = root.rotation.x + _random(-fanRads/2, fanRads/2);
            newBranch.rotation.z = root.rotation.z + _random(-fanRads/2, fanRads/2);

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
        
        var numRoots = _randomInt(3,10);  
        var startRot = _random(Math.PI*2);
        var rootColInt = colorHelper.parseHex(COLOR_BTM);

        //console.log(numRoots+" roots\n");
        for(var i=0; i<numRoots; i++){

            var rootRad = _random(maxBranchRad*0.3,maxBranchRad*0.7);
            var rootLength = _random(branchLength*0.05, branchLength*0.25);

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


    /**
     * Fluffy round clouds in the sky
     * ------------------------------------
     * @return {void} 
     */
    function _buildClouds(){
        
        var numClumps = _randomInt(7);
        
        var cloudMaxRad = 400;
        var thinness = 0.08;

        for(var i=0; i< numClumps; i++){

            var cloudsPerClump = 3 + _randomInt(12);

            var clumpCenterX = _randomInt(-250,250);
            var clumpCenterY = _random(160,700);
            var cloudCol = colorHelper.brightenByAmt(SKY_COL, _randomInt(30));

            console.log("clump "+i+": "+cloudsPerClump+" clouds around "+clumpCenterX+", "+clumpCenterY);

            for(var j=0; j < cloudsPerClump; j++){
                var geometry = new THREE.CircleGeometry(_random(cloudMaxRad), 32);
                
                //var cloudCol = colorHelper.randomHex();
                var material = new THREE.MeshBasicMaterial({
                    color: colorHelper.parseHex(cloudCol)
                });
            
                var cloud = new THREE.Mesh(geometry, material);
                cloud.rotation.x = -Math.PI;
                cloud.scale.y = _random(thinness);
                cloud.scale.x = _random(0.3, 0.7);
                // darker clouds in the background please
                cloud.position.z = 700 + (255 - colorHelper.valueOfHexCol(cloudCol));
                var y_adj = cloudMaxRad*thinness*1.5;
                cloud.position.y = clumpCenterY + _random(-y_adj/2, y_adj/2);
                cloud.position.x = clumpCenterX + _random(-cloudMaxRad/4,cloudMaxRad/4);
                _forest.add(cloud);
        
            }
        }
    }
        

    /**
     * Build and position a bunch of trees in front of the camera to give the impression of a full surrounding forest.
     * Also some ground vegetation, why not.
     * -------------------------------------------------------------------------------------------------------------------
     * @return {void}
     */
    
    function _buildForest() {
        var i;
        var numTrees = _randomInt(NUM_TREES*0.5, NUM_TREES*1.5);
        var groundLeafSize = _pickLeafSize();
        var zInterval = _random(300,400)/NUM_TREES;
       
        // Trees
        for (i = 0; i < NUM_TREES; i++) {
            _data = [];
            while (_depthOfArray(_data) < 3) {
                _numBranches = 0;
                _data = _randomTreeData();
            }

            var workingRad = BRANCH_RAD_MIN + BRANCH_RAD_MAX * _random(0.6, 1);
            var newTree = _treeWithRoots(_data, BRANCH_LENGTH, _depthOfArray(_data), 0, _depthOfArray(_data), workingRad);

            if (i % 3 == 0) {
                // One third of the trees we want relatively close to the center         
                // The last part of the calculation is to avoid running into trees with the camera    
                newTree.position.x = _randomSign(_random(0, 50) + (PATH_MODE ? _random(2,3) : 0));
                //newTree.rotation.x = Math.PI;
                //newTree.position.y = 10;

            } else {
                // and the other half can spread further out
                //newTree.position.x = _randomSign(20 + i/2 + _random(-20,20));
                newTree.position.x = _randomSign(_random(10+i/3,60 + i) + (PATH_MODE ? _random(2,3) : 0));
            }

            var wrappedTree = new THREE.Object3D();
            // If a tree falls in the forest;
            wrappedTree.add(newTree);
             if(Math.random()<0.01){
                wrappedTree.rotation.x = Math.PI/2;
            }
            

            newTree.scale.x = newTree.scale.y = newTree.scale.z = _random(0.8, 1.7);

           
            // Some clumps of vegetation around the base of the trees.
            _makeLeavesAround(newTree, 8 + _randomInt(24), VEG_COLS, groundLeafSize, 0, _random(BRANCH_RAD_MAX, BRANCH_RAD_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);
            _makeLeavesAround(newTree, 8 + _randomInt(24), VEG_COLS, _pickLeafSize(), 0, _random(BRANCH_RAD_MAX, BRANCH_RAD_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);

            // put all the trees behind the first one so we can walk through them
            wrappedTree.position.z = i*zInterval + _random(- zInterval/2, zInterval/2);

            // Good to get an idea of how complicated a thing we are building so we know how anxious to 
            // get about how long it is taking to generate.
            console.log("tree " + i + " has " + _numBranches + " branches");


            _forest.add(wrappedTree);
        }

        // Ground cover
        for (i = 0; i < NUM_TREES * 12; i++) {
            var clump = new THREE.Object3D();
            clump.position.x = _random(-40, 40);
            clump.position.z = i + _random(- 150, 150);
            _makeLeavesAround(clump, _randomInt(0, 15), VEG_COLS, groundLeafSize, 0, 0, GROUNDLEAF_WIDTH);
            _forest.add(clump);
        }
    }

    /**
     * Add some round hills in the bg 
     * Edit: AND the foreground, why not!?
     *       (Inspired by Melissa Launay "Midnight at Firefly Forest")
     * --------------------------------------------------------------
     * @return {void} 
     */
    function _buildHills(){
        var numHills = NUM_TREES;
        var baseScale = _random(1,2);
        for (var i = 0; i < numHills; i++) {
            var hillRadius = _randomInt(10,120);
            var hillColor = _randomFrom(GROUND_COLS); 
            var hill = _buildHill(hillRadius, hillColor);
            hill.scale.y = _random(0.05, 0.15)*baseScale;

            var xSpread = 50 + i*10;
            xSpread = i*10 + hillRadius;
            hill.position.z = i * 10;
            hill.position.x = _random(-xSpread/2 - 5, xSpread/2 + 5);
            hill.position.y = i*0.22 - hillRadius*hill.scale.y;
            _forest.add(hill);
        }
    }

    function _buildStone(col, size){
        var stone = _circleMesh(col, size);
        stone.rotation.x = -Math.PI/2;
        return stone;
    }

    function _buildStar() {
        var starCol = colorHelper.mixHexCols("#FFFFFF", SKY_COL, 0.7, 0.3);
        var star = _circleMesh(starCol, _random(1, 3));
        star.rotation.x = -Math.PI;
        return star;
    }

    function _buildStars(){
        var numStars = _random(100, 200);
        var dome = new THREE.Object3D();
        for(var i=0; i < numStars; i++){
            var star = _buildStar();
            dome.add(star);
            star.position.x = _random(-700, 700);
            star.position.y = _random(-700, 700);
        }
        dome.position.z = 1200;
        dome.position.y = 610;
        _forest.add(dome);
    }


    /**
     * Build a scene with trees!  and hills!  
     * ---------------------------------------------------------------------------------------------
     * @return {void}
     */
    function _buildScene() {

        console.log("_buildScene");
        scene.remove(_forest);
        _data = [];

        _forest = new THREE.Object3D();
        _forest.position.y = -10;

        // hey let's just throw in a whole forest.
        _buildForest();
        _buildHills();
        _buildClouds();
        _buildBushes();
        _forest.add(_flowers());    
        if(PATH_MODE){
            _forest.add(_stonePath());    
        }
        
        if(NIGHT_MODE){
            _buildStars();
        }

        scene.add(_forest);   
    }


    /**
     * Make a scene, turn it into a gif and save it.
     * --------------------------------------------------------------------------------------------
     * @param  {int} numFrames      -- how many frames in the GIF?  (Watch your file size grow!) 
     * @param  {string} filename    -- name for the gif
     * 
     * @return {string}             -- the filename
     */
    _this.generateSceneGIF = function(numFrames, filename) {
        NUM_FRAMES = numFrames;
        _filename = filename;
        _buildScene();
        return(_this.makeGIF());
    };


    //### Make random more readable #########################################3

    /** 
     * with one parameter: return an integer between 0 and a (excluding a)
     * with two parameters: Return an integer between a and b (excluding b)
     */
    function _randomInt(a, b){
        return Math.floor(_random(a, b));
    }

    /** 
     * with one parameter: return a decimal number between 0 and a
     * with two parameters: return a decimal number between a and b
     */
    function _random(a, b){
        var bottom, top;
        if(b == null){
            bottom = 0;
            top = a; 
        } else {
            bottom = a;
            top = b;
        }
        return bottom + Math.random()*(top - bottom);
    }

    /**
     * Return a random element in the array
     */
    function _randomFrom(array){
        return array[Math.floor(Math.random()*array.length)];
    }

    /**
     * Return the number randomly positive or negative
     */
    function _randomSign(num) {
        return num*((Math.random() > 0.5) ? 1 : -1);
    }


}

module.exports = ForestGenerator;
