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
    var Randoms = require('./Randoms.js');
    var DeciduousTrees = require('./DeciduousTrees');
    var ConiferousTrees = require('./ConiferousTrees');
    var Ferns = require('./Ferns.js');
    var SoftwareRenderer = require('three-software-renderer');


    config = require(path.join(__dirname, '../config.js'));

    var colorHelper = new Colors();
    var _r = new Randoms();
    var _decid = new DeciduousTrees();
    var _conif = new ConiferousTrees();
    var _ferns = new Ferns();

    var _forest;
    var _filename;
    var _palette = [];

    var GROUNDLEAF_WIDTH = _r.random(0.3,0.8);

    var NIGHT_MODE = (Math.random() < 0.25);
    var PATH_MODE = (Math.random() < 0.25);

    var NUM_FRAMES = 100;
    
    var NUM_TREES = _r.randomInt(100, 250);

    var SKY_COL, GROUND_COL, GROUND_COLS, VEG_COLS, STONE_COLS;

    _initColors();

    var _noise = perlin.generatePerlinNoise(1000, 1000);
    var _startingNoise = _r.randomInt(_noise.length / 2);


    var scene,
        camera,
        renderer,
        controls;

    scene = new THREE.Scene();

    var sceneWidth, sceneHeight, pixelRatio;
    sceneWidth = 600;
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
    aLittleHigherPos.y = _r.random(3,5);
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
     * What radius should we use for creating leaves?
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
     * Pick the colors that will form the basic palette for the scene.
     * ---------------------------------------------------------------------
     * @return {void} 
     */
    function _initColors() {

        var i;

        // The sky and ground are a pastel blue and a muddy green, randomly permuted
        SKY_COL = NIGHT_MODE ? colorHelper.variationsOn("#4d6876", 120) : colorHelper.variationsOn("#bdeff1", 150);
        GROUND_COL = NIGHT_MODE ? colorHelper.variationsOn("#40523c", 80) : colorHelper.variationsOn("#78836e", 150);
        
        // There are leaves on the ground too.  They match the ground, which varies slightly.
        // And flowers!  Which could be any colour.
        GROUND_COLS = [];
        VEG_COLS = [];
        FLOWER_COLS = [];
        STONE_COLS = [];

        var vegBase = NIGHT_MODE ? GROUND_COL : colorHelper.brightenByAmt(GROUND_COL,_r.random(-30,10));
        
        var stoneGrey = colorHelper.greyHex(NIGHT_MODE?_r.randomInt(20,60):_r.randomInt(90,130));
        var stoneBase = colorHelper.mixHexCols(stoneGrey,GROUND_COL,0.7,0.3);
        stoneBase = colorHelper.mixHexCols(stoneBase,SKY_COL,0.8,0.2);
        // just one colour for the path actually, it's too sparkly otherwise
        STONE_COLS[0] = stoneBase;
 
        for (i = 0; i < 8; i++){
            GROUND_COLS.push(colorHelper.variationsOn(GROUND_COL, 20));
            VEG_COLS.push(colorHelper.variationsOn(vegBase, 40));
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


    function _dirtPath(){
        
        var path = new THREE.Object3D();
        var stepSize = 0.5;
        var currentPoint = new THREE.Vector3(0,0,-30);
        var wending = _r.random(1,3);
        var clusterSpread = _r.random(1,5);
            
        for(var i=0; i<400/stepSize; i++){

            var numStonesInCluster = _r.random(10,20);
            var clusterRadius = _r.random(1,3);
            var minSize = 0.07, maxSize = 0.3;
        
            var cluster = new THREE.Object3D();    
            for(var s=0; s<numStonesInCluster; s++){

                var stoneX = _r.random(-clusterRadius, clusterRadius);
                
                var stoneSize = minSize + maxSize*((clusterRadius - Math.abs(stoneX))/clusterRadius);
                var stone = _buildStone(STONE_COLS[0], stoneSize);
                stone.position.x = stoneX;
                stone.position.z = _r.random(-clusterRadius, clusterRadius);

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

        var id = _r.randomInt(0,9999999);
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

    function _hemisphereMesh(col, radius){
        var sphGeom = new THREE.SphereGeometry(radius, 5, 4, 0, Math.PI*2, 0, Math.PI/2);
        var hex = colorHelper.parseHex(col);         

        for (i = 0; i < sphGeom.faces.length; i ++) {
            sphGeom.faces[i].color.setHex(hex);
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
        var bushBase = colorHelper.mixHexCols(colorHelper.randomHex(),_decid.options.COLOR_BTM,0.3,0.7);
        bushBase = colorHelper.mixHexCols(bushBase,GROUND_COL,0.4,0.6);
        for (i = 0; i < 4; i++){
            cols.push(colorHelper.variationsOn(bushBase, 20));
        }
        return cols;
    }

    function _bush(height,width,colors,leafSize){
       
       var bush = new THREE.Object3D();
       for (var i = 0; i < height*2; i++) {
            var clump = new THREE.Object3D();
            _makeLeavesAround(clump, _r.randomInt(20, 40), colors, leafSize, 0, 0, leafSize);
            clump.position.y = i*0.2;
            clump.position.x = _r.random(-width/2,width/2);
            clump.position.z = _r.random(-width/2,width/2);
            bush.add(clump);
        } 

        bush.position.y = -0.5;
        bush.scale.x = bush.scale.y = bush.scale.z = _r.random(1,1.5);
        return bush;
    }

    function _buildRocks(){
        var numRocks = _r.randomInt(NUM_TREES*2,NUM_TREES*4);
        var baseGrey = colorHelper.greyHex(NIGHT_MODE ? _r.randomInt(10,50) : _r.randomInt(30,100));
        var rockCol = colorHelper.mixHexCols(GROUND_COL,baseGrey,0.6,0.4);
        
        console.log("[) "+numRocks);
        for(var i=0; i<numRocks; i++){
            var rockRad = _r.random(0.1,3);
            var rock = _hemisphereMesh(rockCol, rockRad);

            //rock.position.y = -rockRad*0.6;
            rock.scale.y = _r.random(0.1,0.8);
            rock.scale.x = _r.random(0.5,1);
            rock.position.z = _r.random(-30, 200);
            rock.position.x = _r.randomSign(_r.random(3,40 + i));
            rock.rotation.y = _r.random(0,Math.PI*2);
            _forest.add(rock);
            
        }
    }

    function _buildBushes(){
        var bushHeight = _r.random(0.4,1);
        var bushWidth = _r.randomInt(2,6);
        var numBushes = _r.randomInt(0,NUM_TREES);
        var bushColors = _bushColors();
        var leafSize = _r.random(_decid.options.LEAF_SIZE,_decid.options.LEAF_SIZE);
        var leafWidth = _r.random(0.7,1);
        var i;

        console.log("{}{} "+numBushes);
        
        for (i = 0; i < numBushes; i++) {
          
            //console.log("bush "+i);
            var newBush = _bush(_r.random(bushHeight*0.5,bushHeight*1.2),bushWidth,bushColors,leafSize, leafWidth);
            newBush.position.z = _r.random(-30, 200);
            newBush.position.x = _r.randomSign(_r.random(4,40 + i));
            _forest.add(newBush);
            
        }
        // Add a big ridge at the back of the scene
        for (i = 0; i < 50; i++) {
            var newBush = _bush(_r.random(bushHeight*40,bushHeight*40),bushWidth*5,bushColors,leafSize*4, leafWidth);
            newBush.position.z = _r.random(300, 600);
            newBush.position.x = _r.randomSign(_r.random(0,300));
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
        var numFlowers = _r.randomInt(50, 350);
        var newPath = new THREE.Object3D();
        var petalNum = _r.randomInt(3,8); 
        var basePetalSize = _r.random(0.6, 1);

        var startZ = _r.random(0, 30);
        var zSpread = _r.random(0, 20);
        var startX = _r.random(-20, 20);
        var xSpread = 40;

        for(var i=0; i<numFlowers; i++){

            var petalSize = basePetalSize*_r.random(0.2, 0.5);
            var variedCol = _r.randomFrom(flowerCols);
            
            var flowerCol = variedCol;
            var petalAngle = Math.PI*_r.random(1.25, 1.5);
            var f = new _flower(petalNum, flowerCol, petalSize, petalAngle);
            f.position.z = startZ + i*_r.random(-zSpread/3, zSpread*(2/3));
            f.position.x = startX + _r.random(-xSpread/2, xSpread/2);
            f.position.y = _r.random(0, 0.3);

            f.rotation.x += _r.random(- 0.3, 0.3);
            f.rotation.z += _r.random(- 0.3, 0.3);
            f.scale.x = f.scale.y = f.scale.z = _r.random(0.5, 1);
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
     * Fluffy round clouds in the sky
     * ------------------------------------
     * @return {void} 
     */
    function _buildClouds(){
        
        var numClumps = _r.randomInt(7);
        
        var cloudMaxRad = 400;
        var thinness = 0.08;

        for(var i=0; i< numClumps; i++){

            var cloudsPerClump = 3 + _r.randomInt(12);

            var clumpCenterX = _r.randomInt(-250,250);
            var clumpCenterY = _r.random(160,700);
            var cloudCol = colorHelper.brightenByAmt(SKY_COL, _r.randomInt(30));

            console.log("clump "+i+": "+cloudsPerClump+" clouds around "+clumpCenterX+", "+clumpCenterY);

            for(var j=0; j < cloudsPerClump; j++){
                var geometry = new THREE.CircleGeometry(_r.random(cloudMaxRad), 32);
                
                //var cloudCol = colorHelper.randomHex();
                var material = new THREE.MeshBasicMaterial({
                    color: colorHelper.parseHex(cloudCol)
                });
            
                var cloud = new THREE.Mesh(geometry, material);
                cloud.rotation.x = -Math.PI;
                cloud.scale.y = _r.random(thinness);
                cloud.scale.x = _r.random(0.3, 0.7);
                // darker clouds in the background please
                cloud.position.z = 700 + (255 - colorHelper.valueOfHexCol(cloudCol));
                var y_adj = cloudMaxRad*thinness*1.5;
                cloud.position.y = clumpCenterY + _r.random(-y_adj/2, y_adj/2);
                cloud.position.x = clumpCenterX + _r.random(-cloudMaxRad/4,cloudMaxRad/4);
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
        var numTrees = _r.randomInt(NUM_TREES*0.5, NUM_TREES*1.5);
        var groundLeafSize = _pickLeafSize();
        var zInterval = _r.random(300,400)/NUM_TREES;
       
        // Trees
        for (i = 0; i < NUM_TREES; i++) {
            // Good to get an idea of how complicated a thing we are building so we know how anxious to 
            // get about how long it is taking to generate.
            console.log("tree " + i);
            
            var treetype = _decid; //_conif;
            var newTree = treetype.getTree(treetype.options);


            if (i % 3 == 0) {
                // One third of the trees we want relatively close to the center         
                // The last part of the calculation is to avoid running into trees with the camera    
                newTree.position.x = _r.randomSign(_r.random(0, 50) + (i < 20 ? _r.random(2,3) : 0));
                //newTree.rotation.x = Math.PI;
                //newTree.position.y = 10;

            } else {
                // and the other half can spread further out
                //newTree.position.x = _r.randomSign(20 + i/2 + _r.random(-20,20));
                newTree.position.x = _r.randomSign(_r.random(10+i/3,60 + i) + (i < 20 ? _r.random(2,3) : 0));
            }

            var wrappedTree = new THREE.Object3D();
            // If a tree falls in the forest;
            wrappedTree.add(newTree);
             if(Math.random()<0.01){
                wrappedTree.rotation.x = Math.PI/2;
            }
            

            newTree.scale.x = newTree.scale.y = newTree.scale.z = _r.random(0.8, 1.7);

           
            // Some clumps of vegetation around the base of the trees.
            _makeLeavesAround(newTree, 8 + _r.randomInt(24), VEG_COLS, groundLeafSize, 0, _r.random(treetype.options.BRANCH_R_MAX, treetype.options.BRANCH_R_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);
            _makeLeavesAround(newTree, 8 + _r.randomInt(24), VEG_COLS, _pickLeafSize(), 0, _r.random(treetype.options.BRANCH_R_MAX, treetype.options.BRANCH_R_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);

            // put all the trees behind the first one so we can walk through them
            wrappedTree.position.z = i*zInterval + _r.random(- zInterval/2, zInterval/2);

            _forest.add(wrappedTree);
        }

        // Ground cover
        for (i = 0; i < NUM_TREES * 12; i++) {
            var clump = new THREE.Object3D();
            clump.position.x = _r.randomSign(_r.random(3, 40));
            clump.position.z = i + _r.random(- 150, 150);
            _makeLeavesAround(clump, _r.randomInt(0, 15), VEG_COLS, groundLeafSize, 0, 0, GROUNDLEAF_WIDTH);
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
        var baseScale = _r.random(1,2);
        for (var i = 0; i < numHills; i++) {
            var hillRadius = _r.randomInt(10,120);
            var hillColor = _r.randomFrom(GROUND_COLS); 
            var hill = _buildHill(hillRadius, hillColor);
            hill.scale.y = _r.random(0.05, 0.15)*baseScale;

            var xSpread = 50 + i*10;
            xSpread = i*10 + hillRadius;
            hill.position.z = i * 10;
            hill.position.x = _r.random(-xSpread/2 - 5, xSpread/2 + 5);
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
        var star = _circleMesh(starCol, _r.random(1, 3));
        star.rotation.x = -Math.PI;
        return star;
    }

    function _buildStars(){
        var numStars = _r.random(100, 200);
        var dome = new THREE.Object3D();
        for(var i=0; i < numStars; i++){
            var star = _buildStar();
            dome.add(star);
            star.position.x = _r.random(-700, 700);
            star.position.y = _r.random(-700, 700);
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

        _forest = new THREE.Object3D();
        _forest.position.y = -10;

        _buildForest();
        _buildHills();
        _buildClouds();
        _buildBushes();
        _buildRocks();
        _forest.add(_flowers());    
        if(PATH_MODE){
            _forest.add(_dirtPath());    
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
    _this.generateSceneGIF = function(numFrames, filename, numTrees) {
        NUM_TREES = numTrees || NUM_TREES;
        NUM_FRAMES = numFrames;
        _filename = filename;
        _buildScene();
        return(_this.makeGIF());
    };
}

module.exports = ForestGenerator;
