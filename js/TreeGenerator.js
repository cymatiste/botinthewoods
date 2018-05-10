function TreeGenerator(){
      /*
      
      
    n o d e    v e r s i o n
           of threejs tree generator

    */

    /*
    module.exports['@require'] = [
      'util/colorHelper.js'
    ]
    */
    var _this = this;

    var fs = require('fs');
    var path = require('path');
    PNG = require('pngjs').PNG;
    var THREE = require('three');
    var omggif = require('omggif');
    var perlin = require('perlin-noise');
    //import { Colors } from 'Colors';
    var Colors = require('./Colors.js');
    var SoftwareRenderer = require('three-software-renderer');

    config = require(path.join(__dirname, '../config.js'));

    var colorHelper = new Colors();

    var _tree;
    var _filename;

    //////////////////////////////////////////////////////////////////
    // Some parameters that can be tweakedcls from the browser (we hope)
    //////////////////////////////////////////////////////////////////

    var BRANCH_LENGTH = 2 + Math.random()*4;
    var BRANCH_RAD_MAX = 0.3 + Math.random()*1.2;
    var BRANCH_RAD_MIN = BRANCH_RAD_MAX*(Math.random()*0.03);
    var LENGTH_MULT = 0.85 + Math.random()*0.1;
    var MAX_BRANCHES_PER_NODE = 3 + Math.random()*2;
    var MAX_BRANCHES_TOTAL = 7777;
    var BASE_BRANCH_CHANCE = 0.7 + Math.random()*0.11;
    var CHANCE_DECAY = 0.07 - Math.random()*0.072;
    var MAX_DEPTH = 10;
    var ANGLE_MIN = 30;
    var ANGLE_MAX = 60 + Math.random()*60;

    var LEAF_SIZE = 0.3 + Math.random()*1.4;
    var LEAF_DENSITY = Math.floor(Math.random()*12);

    var NUM_FRAMES = 128;

    var NUM_TREES = 30;

    var COLOR_BTM, COLOR_TOP, SKY_COL, GRND_COL, LEAF_BASE_COL, LEAF_COLS;

    _initColors();

    var treeDepth = 0;

    var _noise = perlin.generatePerlinNoise(10, 480);
    


    /////////////////////////////////////////
    // Scene Setup
    /////////////////////////////////////////

    var scene,
        camera,
        renderer,
        controls;

    scene = new THREE.Scene();

    var _data = randomTreeData();
    while(_data.length == 0){
      _data = randomTreeData();
    }

    var sceneWidth, sceneHeight, pixelRatio;

    if(typeof window == 'undefined'){
      sceneWidth = 800;
      sceneHeight = 800;
      pixelRatio = 1;
    } else {
      sceneWidth = window.innerWidth;
      sceneHeight = window.innerHeight;
      pixelRatio = window.devicePixelRatio;
    }


    camera = new THREE.PerspectiveCamera( 40, sceneWidth / sceneHeight, 1, 1000 );
    camera.position.x = 0;
    camera.position.y = 1;
    camera.position.z = -20;

    var aLittleHigherPos = scene.position;
    aLittleHigherPos.y = 5;
    camera.lookAt( aLittleHigherPos );

    if(typeof windwow == 'undefined'){
       renderer = new SoftwareRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      });
    } else {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      });
    }



    renderer.setPixelRatio( pixelRatio );
    renderer.setSize( sceneWidth, sceneHeight );

    if(typeof document != 'undefined'){
        document.getElementById("theTree").appendChild( renderer.domElement );  
    }


    /////////////////////////////////////////
    // Lighting
    /////////////////////////////////////////

    var ambientLight  = new THREE.AmbientLight( '#8888FF' );

    scene.add( ambientLight );


    /////////////////////////////////////////
    // Utilities
    /////////////////////////////////////////

    var branches = [];
    var tipPositions = [];

    //var b = buildBranch(5);
    //scene.add(b);
    //


    function _initColors(){

        COLOR_BTM = colorHelper.brightenByAmt(colorHelper.randomDark(),50);
        COLOR_TOP = colorHelper.variationsOn(COLOR_BTM,180);

        console.log(COLOR_BTM+" --> "+COLOR_TOP);
        
        var prop1 = 0.4+Math.random()*0.2;
        var prop2 = 1 - prop1;
        //var SKY_COL_INT = colorHelper.parseHex(colorHelper.mixHexCols("#FFFFFF",colorHelper.complimentaryHex(COLOR_BTM),0.8,0.2));
        SKY_COL = colorHelper.variationsOn("#d4e9ff",100);
        GRND_COL = colorHelper.variationsOn("#657753",100);

        //var LEAF_BASE_COL= colorHelper.variationsOn("#66bc46",80);
        LEAF_BASE_COL= colorHelper.variationsOn(colorHelper.randomHex(),80);
        LEAF_COLS = [];
        for(var i=0; i<8; i++){
            LEAF_COLS.push(colorHelper.variationsOn(LEAF_BASE_COL,20));
        }


    }

    function makePaletteFromScene(pal){

        var firstsnap = renderer.render(scene, camera);
        var eightbitbuffer = convertRGBAto8bit(firstsnap.data,pal);

        console.log("generated palette, length "+pal.length);

        //while(!isPowerOfTwo(pal.length)){
        while(pal.length < 256){
            pal.push(Math.floor(Math.random()*0xFFFFFF));
        }

        //console.log("now it's "+pal.length);

        return pal;
    }

    /**
     * h/t https://stackoverflow.com/users/3674420/joseph-palermo
     * @param  {int} n  -   The number that MAY or MAY NOT be a power of two
     * @return {bool}   -   Is it though.
     */
    function isPowerOfTwo(n){
        // Compute log base 2 of n using a quotient of natural logs
        var log_n = Math.log(n)/Math.log(2);
        // Round off any decimal component
        var log_n_floor = Math.floor(log_n);
        // The function returns true if and only if log_n is a whole number
        return log_n - log_n_floor == 0; 
    }

    var _palette = [];

    //var _palette = colorHelper.palette8bit;


    _this.makeGIF = function(){

        console.log("making GIF, filename "+_filename);

     
      _palette = makePaletteFromScene(_palette);

      var gifBuffer = new Buffer(sceneWidth * sceneHeight * NUM_FRAMES); // holds the entire GIF output
      var gif = new omggif.GifWriter(gifBuffer, sceneWidth, sceneHeight, {palette: _palette, loop: 0});
      var y_axis = new THREE.Vector3(0,1,0);
      var startingNoise = Math.floor(Math.random()*_noise.length/2);

      for(var i=0; i<NUM_FRAMES; i++){
        //controls.exposedRotate(300+i,0);
        
        // spin around the central tree
        //_tree.rotateOnAxis(y_axis,Math.PI/(NUM_FRAMES/2));
        
        // walk through the forest
        _tree.position.z -= 0.2;
        var wobble = (_noise[i+startingNoise] - 0.5)/100;
        _tree.rotation.y += wobble;
        //console.log(wobble);


        var pixels = renderer.render(scene, camera);

        console.log(".");
        var frameData = convertRGBAto8bit(pixels.data, _palette);
        gif.addFrame(0, 0, pixels.width, pixels.height, frameData);

      }
      var id = randomId();

      //savePNG(pixels.data, sceneWidth, sceneHeight);

      fs.writeFileSync('./images/'+_filename+'.gif', gifBuffer.slice(0, gif.end()));

    };

    function savePNG(pixelData, width, height){
        // making a png just to check the colours
      var png = new PNG({
        width: width,
        height: height,
        filterType: -1
      });

        for(var i=0;i<pixelData.length;i++) {
        png.data[i] = pixelData[i];
      }
      png.pack().pipe(fs.createWriteStream('./test'+id+'.png'));
    }

    function randomId(){
      return Math.floor(Math.random()*99999);
    }



    function convertRGBAto8bit(rgbaBuffer, palette) {
    
       var outputBuffer = new Uint8Array(rgbaBuffer.length / 4);  
    
       var bgBuffer = [];

       var skyColInt = colorHelper.parseHex(SKY_COL);
       var grndColInt = colorHelper.parseHex(GRND_COL);
       var blend0 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL,GRND_COL,0.9,0.1));
       var blend1 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL,GRND_COL,0.7,0.3));
       var blend2 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL,GRND_COL,0.5,0.5));
       var blend3 = colorHelper.parseHex(colorHelper.mixHexCols(SKY_COL,GRND_COL,0.3,0.7));
    
   
       //for(var i=0; i<rgbaBuffer.length; i+=4) {
       for(var i=0; i<rgbaBuffer.length; i+=4) {
            var colour = (rgbaBuffer[i] << 16) + (rgbaBuffer[i+1] << 8) + rgbaBuffer[i+2];

            var skyline = 1.6;
        
            // if this pixel is transparent, let's fill in a background.
            if(rgbaBuffer[i+3] == 0 && colour == 0){

                if(i < rgbaBuffer.length/(skyline + 0.5)){
                    colour = skyColInt; 
                }  else if (i < rgbaBuffer.length/(skyline + 0.1)){
                    colour = blend0;
                } else if (i < rgbaBuffer.length/(skyline)){
                    colour = blend1;
                }  else if (i < rgbaBuffer.length/(skyline - 0.1)){
                    colour = blend2;
                }  else if (i < rgbaBuffer.length/(skyline - 0.15)){
                    colour = blend3;
                } else {
                    colour = grndColInt;   
                }
                
            }
            
            var foundCol = false;
            for(var p=0; p<palette.length; p++) {     
                if(colour == palette[p]) {
                    //console.log("EXISTING colour "+palette[p]);
                    foundCol = true;
                    outputBuffer[i/4] = p;  
                    break;
                } 
            }   
        
            if(!foundCol && (palette.length < 256)){
                  palette.push(colour);
                  //console.log("NEW colour "+palette[p]);
                  outputBuffer[i/4] = palette.length-1;  
        
            } else if (!foundCol){
        
              //console.log("not existing, palette.length "+palette.length);
              var lowestDiff = 999999999999999999;
              var closestCol = 0xFFFFFF;
              var closestIndex = -1;  
        
              for(var pp=0; pp<palette.length; pp++) {    
                var paletteInt = palette[pp];
                var colourInt = colour;
                var colourDiff = Math.abs( colourInt - paletteInt );
                if(colourDiff < lowestDiff){
                  lowestDiff = colourDiff;
                  closestCol = palette[pp];
                  closestIndex = pp;  
                  //console.log("CLOSEST colour "+palette[p]);
                }
              }
               outputBuffer[i/4] = closestIndex;  
            }
           
          
         }
    
        return outputBuffer;
    }


    var _numBranches = 0;

    function randomTreeData(startingStructure, startingDepth){

      var structure = startingStructure || [];
      var depth = startingDepth || 0;

      if(depth < MAX_DEPTH){
        var branchChance = (BASE_BRANCH_CHANCE - Math.min(BASE_BRANCH_CHANCE,CHANCE_DECAY*depth));
        //var branchChance = BASE_BRANCH_CHANCE;
      
        while(structure.length < MAX_BRANCHES_PER_NODE && Math.random() < branchChance){
          
          if(_numBranches > MAX_BRANCHES_TOTAL){
            break;
          }

          //console.log("at depth "+depth+", chance "+branchChance+", branches so far: "+structure.length);
          var newBranch = randomTreeData([],depth+1); 
          structure.push(newBranch);
          _numBranches++;

        } 
      }
      return structure;
    }


    function depthOfArray(arr) {
      var i;
      var level = 1;
      var subdepths = [];
      for (i=0; i<arr.length; i++){
        subdepths.push(depthOfArray(arr[i]));
      }

      var deepest = 0;
      for (i=0; i<subdepths.length; i++){
        if (subdepths[i] > deepest){
          deepest = subdepths[i];
        }
      }
      level += deepest;

      return level;
    }


    function checkDistance(){

      var tipPositions = [];
      for (var i=0; i<branches.length; i++){

        //branches[i].matrixAutoUpdate && branches[i].updateMatrix();
        //branches[i].tip.matrixAutoUpdate && branches[i].tip.updateMatrix();
        
        var unitVector = new THREE.Vector3();

        console.log(branches[i].tip);
        console.log(branches[i].tip.matrixWorld);
        var tipPos = unitVector.setFromMatrixPosition( branches[i].tip.matrixWorld );
        console.log(tipPos);

        tipPositions.push(tipPos);
      }

    }

    function buildLeaf(leafCol){


        var geometry = new THREE.CircleGeometry( LEAF_SIZE, 8 );

        var material = new THREE.MeshBasicMaterial( { color: colorHelper.parseHex(leafCol) } );
        //var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );

        var leaf = new THREE.Mesh( geometry, material );

        return leaf;
    }

    function de2ra(degree){
      return degree*(Math.PI/180);
    }

    function buildBranch(baseLength, distanceFromTip, distanceFromRoot){
        var length = baseLength*(1 + Math.random()*0.4);

        var referenceLength = Math.min(length, BRANCH_LENGTH);

        var baseRadius = function(distFromTip, distFromRoot){
            var fromBottom = BRANCH_RAD_MIN + ((treeDepth - distFromRoot)/treeDepth)*(BRANCH_RAD_MAX - BRANCH_RAD_MIN); 
            var fromTop = BRANCH_RAD_MIN + ((distFromTip)/treeDepth)*(BRANCH_RAD_MAX - BRANCH_RAD_MIN);
            //return (fromBottom + fromTop)/2;
            return fromTop;
        };

        var radiusBottom =  baseRadius(distanceFromTip, distanceFromRoot);
        var radiusTop = baseRadius(Math.max(0,distanceFromTip-1), distanceFromRoot+1);
        //var radiusBottom =  BRANCH_RAD_MIN + ((distanceFromTip)/treeDepth)*(BRANCH_RAD_MAX - BRANCH_RAD_MIN);
        //var radiusTop = BRANCH_RAD_MIN + ((distanceFromTip-1)/treeDepth)*(BRANCH_RAD_MAX - BRANCH_RAD_MIN);
        
        var cylGeom = new THREE.CylinderGeometry( radiusTop, radiusBottom, length, 8 );
        var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
        var hex;

        var i;

        //console.log("building branch of color "+BASE_TREE_COLOR);

        /*
        if(BASE_TREE_COLOR == "silvergreen" || BASE_TREE_COLOR == "silverblack"){
          cylinderColorFunc = colorHelper.randomGrey;
        } else if (BASE_TREE_COLOR == "blackgreen" || BASE_TREE_COLOR == "blacksilver"){
          cylinderColorFunc = colorHelper.randomDark;
        }
        if(BASE_TREE_COLOR == "silvergreen" || BASE_TREE_COLOR == "blackgreen"){
          nodeColorFunc = colorHelper.randomGreen;
        } else if (BASE_TREE_COLOR == "blacksilver"){
          nodeColorFunc = colorHelper.randomGrey;
        } else if (BASE_TREE_COLOR == "silverblack"){
          nodeColorFunc = colorHelper.randomBlack;
        }
        */
       
       //console.log("  ~ ~ ~  "+distanceFromRoot+" / "+treeDepth);

       var propBtm = (treeDepth - distanceFromRoot)/treeDepth;
       var propTop = 1 - propBtm;
       
        var branchCol = colorHelper.mixHexCols(COLOR_BTM, COLOR_TOP, propBtm, propTop);
        //console.log("branchCol is "+branchCol+", from "+COLOR_BTM+" and "+COLOR_TOP+" mixed "+propBtm+" to "+propTop);

        //var branchCols = [];
        //for (i = 0; i < 4; i++){
        //    branchCols.push(colorHelper.variationsOn(branchCol,20));
        //}

        var nodeColorFunc = function(){
            //var nodecol = colorHelper.variationsOn(branchCol, 10);
            //return nodecol;
            return branchCol;
        };

        var cylinderColorFunc = function(){
            // return branchCols[Math.floor(Math.random()*branchCols.length)];
           return branchCol;
        };

        for ( i = 0; i < cylGeom.faces.length; i += 2 ) {    
          hex = colorHelper.parseHex(cylinderColorFunc());
          cylGeom.faces[ i ].color.setHex( hex );
          cylGeom.faces[ i + 1 ].color.setHex( hex );
        }

        for ( i = 0; i < sphGeom.faces.length; i += 2 ) {   
          hex = colorHelper.parseHex(nodeColorFunc());
          sphGeom.faces[ i ].color.setHex( hex );
          sphGeom.faces[ i + 1 ].color.setHex( hex );
        }

        var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );
        //var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );

        var cylinder = new THREE.Mesh( cylGeom, material );
        cylinder.position.y = length/2;
    
        
        var sphere = new THREE.Mesh(sphGeom, material);


        var tip = new THREE.Object3D();
        tip.position.y = length;
        tip.add(sphere);

        var branch = new THREE.Object3D();
        branch.add( cylinder );
        branch.add(tip);
        branch.tip = tip;
        branch.length = length;

        //console.log("distance from tip: "+distanceFromTip);

        if(distanceFromTip == 1){
            var numLeaves = Math.floor(LEAF_DENSITY/2 + Math.random()*(LEAF_DENSITY/2));            

            //console.log("adding "+numLeaves+" leaves.");
            for( i=0; i<numLeaves; i++){

                var leaf_col = LEAF_COLS[Math.floor(Math.random()*LEAF_COLS.length)];
                
                //var leaf_col = colorHelper.variationsOn(COLOR_TOP,50);
                var newLeaf = buildLeaf(leaf_col);

                newLeaf.position.x += Math.random()*2 - 1;
                newLeaf.position.y += Math.random()*3;
                newLeaf.position.z += Math.random()*2 - 1;
                

                newLeaf.rotation.x = Math.random()*2*Math.PI;
                newLeaf.rotation.y = Math.random()*2*Math.PI;
                newLeaf.rotation.z = Math.random()*2*Math.PI;
                
                branch.tip.add(newLeaf);
            }
        }

        return( branch );
    }


    function buildTree(treeData,branchLength,depth,height){

      //console.log("building tree with "+treeData.length+" branches.");
      var fanRads = de2ra((ANGLE_MIN + (Math.random()*(ANGLE_MAX - ANGLE_MIN))));
      if (height<2){
        fanRads = fanRads/4;
      }

      var root = buildBranch(branchLength, depth, height);


      for(var i=0; i<treeData.length; i++){
        var newBranch = buildTree(treeData[i], branchLength*LENGTH_MULT, depthOfArray(treeData[i]), height+1);
        newBranch.rotation.x = root.rotation.x + (Math.random()*fanRads) - fanRads/2;
        newBranch.rotation.z = root.rotation.z + (Math.random()*fanRads) - fanRads/2;
        //newBranch.position.y = -0.05;
        newBranch.position.y = (height==0)? 0 : -Math.random()*(branchLength/3);

        root.tip.add(newBranch);
      }

      return root;
      
    }

    function _buildForest(){
        for(var i=0; i<NUM_TREES; i++){
        _data = [];
        while(_data.length == 0) {
            _numBranches = 0;
            _data = randomTreeData();
        }
        console.log("secondary tree has "+_numBranches+" branches.");
        //_initColors();
        var newTree = buildTree(_data,BRANCH_LENGTH,treeDepth,0); 
        newTree.position.x = (1 + Math.random()*20)*_randomSign() - _tree.position.x;
        // put all the trees behind the first one so we can walk through them
        newTree.position.z = i*15 + (Math.random()*10 - 5);
        _tree.add(newTree);
      }
    }

    function _buildScene(){
      scene.remove(_tree);
      _data = [];

      while(_data.length == 0) {
        _numBranches = 0;
        _data = randomTreeData();
      }
      console.log("random tree has "+_numBranches+" branches.");

      treeDepth = depthOfArray(_data);

      _tree = buildTree(_data,BRANCH_LENGTH,treeDepth,0); 
      _tree.position.x = (5 + Math.random()*5)*_randomSign();
      _tree.position.y = -10;

      // hey let's just throw in a whole forest.
      _buildForest();

      scene.add(_tree);

      _this.makeGIF();
    }

    function _randomSign(){
        return (Math.random()>0.5) ? 1 : -1;
    }


    _this.makeNewTree = function(filename){
        _filename = filename;
        _buildScene();
        renderScene();
    };


    /////////////////////////////////////////
    // Render Loop
    /////////////////////////////////////////

    function renderScene() {
      renderer.render( scene, camera );
    }


    /////////////////////////////////////////
    // Window Resizing
    /////////////////////////////////////////
    if(typeof window != 'undefined'){

      window.addEventListener( 'resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
          //controls.handleResize();
          renderScene();
      }, false );

    }



    /*
    /////////////////////////////////////////
    // Object Loader
    /////////////////////////////////////////

    var dae,
        loader = new THREE.ColladaLoader();

    function loadCollada( collada ) {
      dae = collada.scene;
      dae.position.set(0.4, 0, 0.8);
      //scene.add(dae);
      renderPhone();
    }

    loader.options.convertUpAxis = true;
    loader.load( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/392/iphone6.dae', loadCollada);

    */


}

module.exports = TreeGenerator;