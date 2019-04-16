function ForestGenerator(forestOptions, treeOptions) {
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
    var ConiferousTrees = require('./ConiferousButLooksDeciduousHmmm');
    //var Moon = require('./Moon');
    var Ferns = require('./Ferns.js');
    var SoftwareRenderer = require('three-software-renderer');


    config = require(path.join(__dirname, '../config.js'));

    var _c = new Colors();
    var _r = new Randoms();
    
    var _ferns = new Ferns();

    var _forest;
    var _filename;
    var _palette = [];

    var _forestOptions = forestOptions;
    var _treeOptions = treeOptions;

    var _rainbow = _forestOptions.RAINBOW;

    var GROUNDLEAF_WIDTH = _r.random(0.3,0.8);

    var NIGHT_MODE = _forestOptions.NIGHT_MODE || (Math.random() < 0.25);
    var PATH_MODE = (Math.random() < 0.25);
    _treeOptions.NIGHT_MODE = NIGHT_MODE;

    var NUM_FRAMES = 100;
    
    var NUM_TREES = _forestOptions.NUM_TREES || _r.randomInt(50, 200);
    var _trees = [];

    var SKY_COL, GROUND_COL, GROUND_COLS, VEG_COLS, STONE_COLS;

    var _RIDGE_Z1 = 700;
    var _RIDGE_Z2 = 800;

    

    var _decid = new DeciduousTrees(_treeOptions);
    var _conif = new ConiferousTrees(_treeOptions);

    _initColors();
    //var _moon = new Moon();

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
    camera.position.y = 3;
    camera.position.z = -60;

    var aLittleHigherPos = scene.position;
    aLittleHigherPos.y = 6;
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
        //SKY_COL = NIGHT_MODE ? (_decid.options.RAINBOW? _c.variationsOn("#222222", 20) : _c.variationsOn("#4d6876", 120)) : (_decid.options.RAINBOW? _c.variationsOn("#F0F0F0", 50) : _c.variationsOn("#bdeff1", 150));
        //GROUND_COL = NIGHT_MODE ? (_decid.options.RAINBOW? _c.variationsOn("#111111", 30) : _c.variationsOn("#40523c", 80)) : _c.brightenByAmt(_c.variationsOn("#78836e", 150),_r.randomInt(-25,-75));
        SKY_COL = NIGHT_MODE ? _c.variationsOn("#4d6876", 120) : _c.variationsOn("#bdeff1", 150);
        GROUND_COL = NIGHT_MODE ? _c.variationsOn("#40523c", 80) : _c.brightenByAmt(_c.variationsOn("#78836e", 150),_r.randomInt(-25,-75));
       

        // There are leaves on the ground too.  They match the ground, which varies slightly.
        // And flowers!  Which could be any colour.
        GROUND_COLS = [];
        VEG_COLS = [];
        FLOWER_COLS = [];
        STONE_COLS = [];

        var vegBase = NIGHT_MODE ? GROUND_COL : _c.brightenByAmt(GROUND_COL,_r.random(-30,10));
        
        var stoneGrey = _c.greyHex(NIGHT_MODE?_r.randomInt(20,60):_r.randomInt(90,130));
        var stoneBase = _c.mixHexCols(stoneGrey,GROUND_COL,0.7,0.3);
        stoneBase = _c.mixHexCols(stoneBase,SKY_COL,0.8,0.2);
        // just one colour for the path actually, it's too sparkly otherwise
        STONE_COLS[0] = stoneBase;
 
        for (i = 0; i < 8; i++){
            GROUND_COLS.push(_c.variationsOn(GROUND_COL, 20));
            VEG_COLS.push(_c.variationsOn(vegBase, 40));
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
            pal.push(_c.parseHex(_c.variationsOn(GROUND_COL),15));
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

            /*
            if(_rainbow && i%5==0){
                SKY_COL = _c.randomHex();
                GRND_COL = _c.randomHex();
            }
            */

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
        var skyColInt = _c.parseHex(SKY_COL);
        var grndColInt = _c.parseHex(GROUND_COL);
        var blend0 = _c.parseHex(_c.mixHexCols(SKY_COL, GROUND_COL, 0.9, 0.1));
        var blend1 = _c.parseHex(_c.mixHexCols(SKY_COL, GROUND_COL, 0.7, 0.3));
        var blend2 = _c.parseHex(_c.mixHexCols(SKY_COL, GROUND_COL, 0.5, 0.5));
        var blend3 = _c.parseHex(_c.mixHexCols(SKY_COL, GROUND_COL, 0.3, 0.7));

        

        for (var i = 0; i < rgbaBuffer.length; i += 4) {
            var color = (rgbaBuffer[i] << 16) + (rgbaBuffer[i + 1] << 8) + rgbaBuffer[i + 2];

            // stripes
            // big fat ones: i%65000
            if(_rainbow && i%_r.random(9999)==0){
                skyColInt = _c.parseHex(_c.randomHex());
                grndColInt = _c.parseHex(_c.randomHex());
                blend0 = _c.parseHex(_c.randomHex());
                blend1 = _c.parseHex(_c.randomHex());
                blend2 = _c.parseHex(_c.randomHex());
                blend3 = _c.parseHex(_c.randomHex());
            }

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

            if(i > 8 && _forestOptions.EFFECT){
                //outputBuffer = _staticEffect(i,outputBuffer);
                var effectSpacing = _r.randomInt(8,11);
                var lastPixel = palette[outputBuffer[(i-4)/4]];
                var prevPixel = palette[outputBuffer[(i-8)/4]];
                //console.log(lastPixel+", "+prevPixel);
                if(i%effectSpacing <2 && lastPixel != prevPixel){
                   //color = _c.hexToInt(_c.addHexCols(lastPixel,prevPixel));
                   color = _c.hexToInt(_c.randomHex());
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

    function _staticEffect(i, outputBuffer){
        if(i%_r.randomInt(12,13) < _r.randomInt(4)){
            var skipBack = _r.randomInt(10)*4;
            if(i>skipBack){
                outputBuffer[i / 4] = outputBuffer[(i-skipBack)/4];
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

    function _circleMesh(col, radius, opacity) {

        var geometry = new THREE.CircleGeometry(radius, 8);

        var material = new THREE.MeshLambertMaterial( { 
            color: _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(col),
            transparent: true 
        });
        material.opacity = opacity;

        return new THREE.Mesh(geometry, material);
    }

    function _hemisphereMesh(col, radius){
        var sphGeom = new THREE.SphereGeometry(radius, 5, 4, 0, Math.PI*2, 0, Math.PI/2);    
        var hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(col);

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

        var hill = _circleMesh(col,size);
        hill.rotation.x = -Math.PI;
        return hill;
    }

    function _bushColors(){
        var cols = [];
        var bushBase = _c.mixHexCols(_c.randomHex(),_decid.options.COLOR_BTM,0.3,0.7);
        bushBase = _c.mixHexCols(bushBase,GROUND_COL,0.4,0.6);
        for (i = 0; i < 4; i++){
            cols.push(_c.variationsOn(bushBase, 20));
        }
        return cols;
    }

    function _bush(height,width,colors,leafSize){
       
       var bush = new THREE.Object3D();
       for (var i = 0; i < height*4; i++) {
            var clump = new THREE.Object3D();
            _makeLeavesAround(clump, _r.randomInt(20, 40), colors, leafSize, 0, 0, leafSize);
           
            clump.position.x = _r.random(-width,width);
            clump.position.z = _r.random(-width,width);
            //clump.position.y = i*0.2;
            
            // shaping this into a rough upside down parabola
            clump.position.y = _r.random(0,(height*0.7) - (Math.abs(clump.position.x))*(Math.abs(clump.position.x))/32);
            bush.add(clump);
        } 

        bush.position.y = -0.5;
        bush.scale.x = bush.scale.y = bush.scale.z = _r.random(1,1.5);
        return bush;
    }

    function _buildRocks(){
        var numRocks = _r.randomInt(NUM_TREES*2,NUM_TREES*4);
        var baseGrey = _c.greyHex(NIGHT_MODE ? _r.randomInt(10,50) : _r.randomInt(30,100));
        var rockCol = _c.mixHexCols(GROUND_COL,baseGrey,0.6,0.4);
        
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
        var bushWidth = _r.randomInt(4,12);
        var numBushes = _r.randomInt(0,NUM_TREES);
        var bushColors = _bushColors();
        var leafSize = _r.random(_decid.options.LEAF_SIZE,_decid.options.LEAF_SIZE);
        var leafWidth = _r.random(0.7,1);
        var i;

        var backBushCols = [];
        for(var i=0; i<bushColors.length; i++){
            backBushCols.push(_c.brightenByAmt(bushColors[i],_r.random(-10,10)));
        }

        console.log("{}{} "+numBushes);
        
        for (i = 0; i < numBushes; i++) {
          
            //console.log("bush "+i);
            var newBush = _bush(_r.random(bushHeight*0.5,bushHeight*1.2),bushWidth,bushColors,leafSize, leafWidth);
            newBush.position.z = _r.random(-30, 200);
            newBush.position.x = _r.randomSign(_r.random(4,40 + i));
            newBush.position.y = 1;
            _forest.add(newBush);
            
        }
        // Add a big ridge at the back of the scene
        if(_decid.options.RAINBOW){
            // unless it's a rainbow render, then, don't bother, too much background detail, ow my eyes.
            //return;
        }

        var numBackBushes = Math.max(60,NUM_TREES*0.6);
        for (i = 0; i < NUM_TREES*0.6; i++) {
            var newBush = _bush(_r.random(bushHeight*50,bushHeight*80),bushWidth*8,backBushCols,leafSize*4, leafWidth*4);
            newBush.position.z = _r.random(_RIDGE_Z1, _RIDGE_Z2);
            newBush.position.x = _r.randomSign(_r.random(0,300));
            newBush.position.y = -10;
            _forest.add(newBush);
        }
    }

    function _flowerColors(){
        var cols = [];
        var flowerBase = _c.randomHex();
        if(NIGHT_MODE){
            flowerBase = _c.brightenByAmt(flowerBase, -100);
        }
        for (var i = 0; i < 4; i++){
            cols.push(_c.variationsOn(flowerBase, 50));
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

            var petal = _circleMesh(col, petalSize);
            
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
            var cloudCol = _c.brightenByAmt(SKY_COL, _r.randomInt(30));

            console.log("clump "+i+": "+cloudsPerClump+" clouds around "+clumpCenterX+", "+clumpCenterY);

            for(var j=0; j < cloudsPerClump; j++){
            
                var cloud = _circleMesh(cloudCol, _r.random(cloudMaxRad, 0.5));
                cloud.rotation.x = -Math.PI;
                cloud.scale.y = _r.random(thinness);
                cloud.scale.x = _r.random(0.3, 0.7);
                // darker clouds in the background please
                cloud.position.z = 700 + (255 - _c.valueOfHexCol(cloudCol));
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
        var farEdge = _r.random(600,900);
        var zInterval = farEdge/NUM_TREES;
        var xInterval = _r.random(150,250)/NUM_TREES;

        //Ground
        var planeGeom = new THREE.SphereGeometry( 500, 32, 32 );
        var planeMat = new THREE.MeshBasicMaterial( {color: _c.parseHex(GROUND_COL)} );
        var planeSphere = new THREE.Mesh( planeGeom, planeMat );
        planeSphere.position.y = -1;
        planeSphere.position.z = 300;
        planeSphere.scale.y = 0.0001;
        _forest.add( planeSphere );

        var xPositions = [];
        for (i = 0; i < NUM_TREES*2; i++) {
            xPositions.push((i%NUM_TREES)*xInterval);
        }
        xPositions = _r.shuffle(xPositions);

        // Trees
        for (i = 0; i < NUM_TREES*2; i++) {
            // Good to get an idea of how complicated a thing we are building so we know how anxious to 
            // get about how long it is taking to generate.
            console.log("tree " + i);
            
            var treetype = forestOptions.TREE_TYPE == "coniferous" ? _conif : _decid;
            //var treetype = _conif;

            var newTree, wrappedTree;

            if(i < NUM_TREES){
                newTree = treetype.getTree(treetype.options);
                 wrappedTree = new THREE.Object3D();
                 wrappedTree.add(newTree);
                 wrappedTree.rotation.y = _r.random(Math.PI*2);
            } else {
                wrappedTree = _trees[i-NUM_TREES].clone(true);
            }
             _trees.push(wrappedTree);
            // If a tree falls in the forest;
            
            var atreefalls = Math.random();
            if(atreefalls < 0.01){
                wrappedTree.rotation.x = Math.PI/2;
            } else if (atreefalls < 0.1){
                wrappedTree.rotation.z = Math.PI/2;
            }
            wrappedTree.rotation.y = Math.random()*Math.PI*2;

            wrappedTree.position.x = _r.randomSign(xPositions[i]/2 + ((i < 20) ? _r.random(5,8) : 0));          

            if(i < NUM_TREES){
                // scatter these throughout the field
                wrappedTree.position.z = i*zInterval - _r.random(0, zInterval);  

                // Some clumps of vegetation around the base of the trees.
                 _makeLeavesAround(newTree, 8 + _r.randomInt(24), VEG_COLS, groundLeafSize, 0, _r.random(treetype.options.BRANCH_R_MAX,     treetype.options.BRANCH_R_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);
                 _makeLeavesAround(newTree, 8 + _r.randomInt(24), VEG_COLS, _pickLeafSize(), 0, _r.random(treetype.options.BRANCH_R_MAX,        treetype.options.BRANCH_R_MAX*2*newTree.scale.x), GROUNDLEAF_WIDTH);
                 
            } else {
                //add the last trees to the bush ridge at the back of the scene
                // don't bother with the ground leaves, we can't see well that far back.
                wrappedTree.position.z = _r.random(_RIDGE_Z1*0.8, _RIDGE_Z2);

                // let's test grouping these all closer.
                wrappedTree.position.x =  _r.randomSign(xPositions[i] + ((i < 12)? _r.random(3,5) : 0));          

            }

            wrappedTree.scale.x = wrappedTree.scale.y = wrappedTree.scale.z = _r.random(0.8, 1.8);
            
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

    function _grassBlade(){

        let grassHeight = _r.randomInt(5,8);
        let grassWidth = 0.25;
        let grassCol = _rainbow ? _c.randomHex() : _c.brightenByAmt(_r.randomFrom(GROUND_COLS),-10);
        let bend = _r.random(0,0.1);
        //(baseLength, distanceFromTip, distanceFromRoot, fullTreeDepth, minRad, maxRad)
        var root = _grassSegment(0.01, grassHeight, 0, grassHeight, grassWidth, grassWidth, grassCol);
        let workingRoot = root;
        for (let i = 0; i < grassHeight; i++) {
            
            let segment = _grassSegment(_treeOptions.BRANCH_L/8, grassHeight-i, i, grassHeight, grassWidth*((grassHeight-(i+1))/grassHeight), grassWidth*((grassHeight -i)/grassHeight), grassCol);

            segment.scale.x = 0.1;
            segment.rotation.x = bend;
            workingRoot.tip.add(segment);
            workingRoot = segment;
        }
        root.rotation.x = _r.random(-Math.PI/5, Math.PI/5);
        root.rotation.y = _r.random(0,Math.PI*2);

        return root;
    }

        /**
     * HASTILY STOLEN FROM BUILDBRANCH
     * ---------------------------------------------------------------------------------------------------
     * @param  {Number} baseLength          -- how long are segments at base? Will vary based on this.
     * @param  {int} distanceFromTip        -- how many nodes away from the blade tip is this node?
     * @param  {int} distanceFromRoot       -- how many nodes is this node away from the ground?
     * @param  {int} fullTreeDepth          -- how many nodes has the longest path from root to tip?
     * @param  {Number} minRad              -- minimum segment radius
     * @param  {Number} maxRad              -- maximum segment radius
     * 
     * @return {THREE.Object3D}             -- a 3d object holding the segment
     */
    function _grassSegment(baseLength, distanceFromTip, distanceFromRoot, fullTreeDepth, minRad, maxRad, branchCol) {

        var i;
        var length = baseLength;// * _r.random(0.5, 0.7);

        // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
        var referenceLength = Math.min(length, _treeOptions.BRANCH_L);

        var baseRadius = function(distFromTip, distFromRoot) {
            return minRad + ((distFromTip) / fullTreeDepth) * (maxRad - minRad);
        };

        if(distanceFromRoot <= 1){
            length *= 2;
        }

        var radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
        var radiusTop = baseRadius(Math.max(0, distanceFromTip - 1), distanceFromRoot + 1);

        var cylGeom = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 4);
        var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
        var hex;

        var propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
        var propTop = 1 - propBtm;

        
        //var branchCol = _rainbow ? _c.randomHex() : _c.mixHexCols(_r.randomFrom(GROUND_COLS), _r.randomFrom(GROUND_COLS), propBtm, propTop);


        for (i = 0; i < cylGeom.faces.length; i ++) {
            hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
            cylGeom.faces[i].color.setHex(hex);
        }

        for (i = 0; i < sphGeom.faces.length; i ++) {
            hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(branchCol);
            sphGeom.faces[i].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });

        var cylinder = new THREE.Mesh(cylGeom, material);
        cylinder.position.y = length / 2;

        //var sphere = new THREE.Mesh(sphGeom, material);

        var tip = new THREE.Object3D();
        tip.position.y = length;
        //tip.add(sphere);

        var branch = new THREE.Object3D();
        branch.add(cylinder);
        branch.add(tip);
        branch.tip = tip;
        branch.length = length;

        //console.log("grass segment l "+length+", minrad "+minRad+" maxrad "+maxRad);
        return branch;
    }
    

    function _growGrass(){
        var patchSize = _forestOptions.GRASS_DENSITY;
        let clusterSize = _r.random(0,2);
        let numInCluster = _r.random(4,10);
        if(_forestOptions.GRASS_DENSITY==0){
            return;
        }
        for(let i=0; i<_trees.length; i++){
            console.log("grass "+i);

            for(let j=0; j<patchSize; j+=numInCluster){
                
                let clumpPos = {
                    x: _trees[i].position.x + _r.randomSign(_r.random(0,40)),
                    y: _trees[i].position.y,
                    z: _trees[i].position.z + _r.randomSign(_r.random(0,40))
                }
                for(let k=0; k<numInCluster; k++){
                    let blade = _grassBlade();
                    blade.position.x = clumpPos.x + _r.randomSign(_r.random(0,clusterSize));
                    blade.position.y = clumpPos.y + _r.randomSign(_r.random(0,clusterSize));
                    blade.position.z = clumpPos.z + _r.randomSign(_r.random(0,clusterSize));
                    blade.scale.x = blade.scale.y = blade.scale.z = 0.3;
                    _forest.add(blade);
                }
                
                numInCluster = _r.randomInt(4,10);
            }
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
            var zSpread = 600/numHills;
            hill.position.z = i * zSpread;
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
        var starCol = _c.mixHexCols("#FFFFFF", SKY_COL, 0.7, 0.3);
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

    function _buildMoon(){
        var moon = _moon.todaysMoon(SKY_COL);
        moon.position.z = 1100;
        moon.position.y = _r.random(-700, 600);
        _forest.add(moon);
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
        _forest.position.y = -20;
        //_forest.position.z = -_r.random(20,40);

        _buildForest();
        _buildHills();
        _buildClouds();
        _buildBushes();
        _buildRocks();
        _growGrass();
        _forest.add(_flowers());    
        if(PATH_MODE){
            _forest.add(_dirtPath());    
        }
        
        if(NIGHT_MODE){
            _buildStars();
            //_buildMoon();
        }

       scene.add(_forest);   
       _forest.position.z = _r.random(-20,80);
       //_forest.position.z = -_r.random(40,80);
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
        console.log(JSON.stringify(_forestOptions)+"\n"+JSON.stringify(_treeOptions));
        _buildScene();
        return(_this.makeGIF());
    };
}

module.exports = ForestGenerator;