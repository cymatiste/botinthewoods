  /*
   I8                                                 
   I8                                                 
88888888                                 gg           
   I8                                    ""           
   I8    ,gggggg,   ,ggg,    ,ggg,       gg    ,g,    
   I8    dP""""8I  i8" "8i  i8" "8i      8I   ,8'8,   
  ,I8,  ,8'    8I  I8, ,8I  I8, ,8I     ,8I  ,8'  Yb  
 ,d88b,,dP     Y8, `YbadP'  `YbadP'   _,d8I ,8'_   8) 
 8P""Y88P      `Y8888P"Y888888P"Y888888P"888P' "YY8P8P
                                       ,d8I'          
                                     ,dP'8I           
                                    ,8"  8I           
                                    I8   8I           
                                    `8, ,8I           
                                     `Y8P"        

I got the starter code for setting up the camera and trackball controls from some tutorial. 
I've just started learning threejs!
The stuff that actually creates the tree is all mine, and I've messed with the rest to make it do what I want.
pretty ascii header in 'nvscript' c/o http://www.kammerl.de/ascii/AsciiSignature.php
*/

//////////////////////////////////////////////////////////////////
// Some parameters that can be tweaked from the browser (we hope)
//////////////////////////////////////////////////////////////////

var BRANCH_LENGTH = 5;
var LENGTH_MULT = 0.85;
var MAX_BRANCHES_PER_NODE = 9;
var BASE_BRANCH_CHANCE = 0.75;
var CHANCE_DECAY = 0.05;
var BASE_TREE_COLOR = "silvergreen";
var MAX_DEPTH = 10;
var ANGLE_MIN = 30;
var ANGLE_MAX = 120;


MAX_BRANCHES_PER_NODE = parseInt(getParameterByName("maxbranches")) || MAX_BRANCHES_PER_NODE;
BASE_BRANCH_CHANCE = parseFloat(getParameterByName("branchp")) || BASE_BRANCH_CHANCE;
CHANCE_DECAY = parseFloat(getParameterByName("pdecay")) || CHANCE_DECAY;
MAX_DEPTH = parseInt(getParameterByName("maxdepth")) || MAX_DEPTH;
ANGLE_MIN = parseInt(getParameterByName("anglemin")) || ANGLE_MIN;
ANGLE_MAX = parseInt(getParameterByName("anglemax")) || ANGLE_MAX;
BASE_TREE_COLOR = getParameterByName("treecolor") || BASE_TREE_COLOR;
BRANCH_LENGTH = parseInt(getParameterByName("branchl")) || BRANCH_LENGTH;
LENGTH_MULT = parseFloat(getParameterByName("lengthmult")) || LENGTH_MULT;


document.getElementById("maxbranchinput").value = MAX_BRANCHES_PER_NODE;
document.getElementById("branchpinput").value = BASE_BRANCH_CHANCE;
document.getElementById("pdecayinput").value = CHANCE_DECAY;
document.getElementById("maxdepthinput").value = MAX_DEPTH;
document.getElementById("anglemininput").value = ANGLE_MIN;
document.getElementById("anglemaxinput").value = ANGLE_MAX;
document.getElementById("branchlinput").value = BRANCH_LENGTH;
document.getElementById("lengthmultinput").value = LENGTH_MULT;

var colorIndex;
if (BASE_TREE_COLOR == "silvergreen"){
  colorIndex = 0;
} else if (BASE_TREE_COLOR == "silverblack"){
  colorIndex = 1;
} else if (BASE_TREE_COLOR == "blacksilver"){
  colorIndex = 2;
} else if (BASE_TREE_COLOR == "blackgreen"){
  colorIndex = 3;
}
document.getElementById("treecolorinput").selectedIndex = colorIndex;

console.log("selected color is "+BASE_TREE_COLOR);

var treeDepth = 0;



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

camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = -50;

var aLittleHigherPos = scene.position;
aLittleHigherPos.y -= 12;
camera.lookAt( aLittleHigherPos );

renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.getElementById("theTree").appendChild( renderer.domElement );


/////////////////////////////////////////
// Trackball Controller
/////////////////////////////////////////

controls = new THREE.TrackballControls( camera, renderer.domElement  );
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 0.2;
controls.noZoom = false;
controls.noPan = true;
controls.dynamicDampingFactor = 0.5;


/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

var ambientLight  = new THREE.AmbientLight( '#EEEEEE' );

scene.add( ambientLight );


/////////////////////////////////////////
// Utilities
/////////////////////////////////////////

var axisHelper = new THREE.AxesHelper( 1.25 );
//scene.add( axisHelper );

var branches = [];
var tipPositions = [];

//var b = buildBranch(5);
//scene.add(b);
//

/**
 * Thank you to https://stackoverflow.com/users/1045296/jolly-exe for this function
 */
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function hideMetaStuff(){
  document.getElementById("metaStuff").style.visibility = "hidden";
  document.getElementById("instructions").style.visibility = "hidden";
}

function makeGIF(){
  var img_frames = [];
  var NUM_FRAMES = 10;
  for(var i=0; i<NUM_FRAMES; i++){
      controls.exposedRotate(300+i,0);
      
      renderer.render( scene, camera );

      img_frames.push(renderer.domElement.toDataURL('image/png'));

      //window.open(renderer.domElement.toDataURL('image/png'), 'screenshot'+i);    
  }
}

function randomTreeData(startingStructure, startingDepth){

  var structure = startingStructure || [];
  var depth = startingDepth || 0;

  if(depth < MAX_DEPTH){
    var branchChance = (BASE_BRANCH_CHANCE - Math.min(BASE_BRANCH_CHANCE,CHANCE_DECAY*depth));
    //var branchChance = BASE_BRANCH_CHANCE;
  
    while(structure.length < MAX_BRANCHES_PER_NODE && Math.random() < branchChance){
      //console.log("at depth "+depth+", chance "+branchChance+", branches so far: "+structure.length);
      var newBranch = randomTreeData([],depth+1); 
      structure.push(newBranch);
    } 
  }

  return structure;
}


function depthOfArray(arr) {
  var i;
  var level = 1;
  var subdepths = [];
  for (var i=0; i<arr.length; i++){
    subdepths.push(depthOfArray(arr[i]));
  }

  var deepest = 0;
  for (var i=0; i<subdepths.length; i++){
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

function buildComplexShape(){

}

function de2ra(degree){
  return degree*(Math.PI/180);
}

function buildBranch(baseLength, distanceFromTip){
    var length = baseLength*(1 + Math.random()*0.4);

    var referenceLength = Math.min(length, BRANCH_LENGTH);

    var radiusTop =  (distanceFromTip == treeDepth)? 0.45 :(distanceFromTip <= 1) ? 0.07 : (referenceLength/20);
    var radiusBottom = (distanceFromTip == treeDepth)? 0.75 : (distanceFromTip == treeDepth-1 && !(distanceFromTip <= 1)) ? 0.45 : (referenceLength/17);
    
    var cylGeom = new THREE.CylinderGeometry( radiusTop, radiusBottom, length, 8 );
    var sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
    var hex;

    var i, cylinderColorFunc, nodeColorFunc;

    console.log("building branch of color "+BASE_TREE_COLOR);

    if(BASE_TREE_COLOR == "silvergreen" || BASE_TREE_COLOR == "silverblack"){
      cylinderColorFunc = xstnt.Colors.randomGrey;
    } else if (BASE_TREE_COLOR == "blackgreen" || BASE_TREE_COLOR == "blacksilver"){
      cylinderColorFunc = xstnt.Colors.randomDark;
    }
    if(BASE_TREE_COLOR == "silvergreen" || BASE_TREE_COLOR == "blackgreen"){
      nodeColorFunc = xstnt.Colors.randomGreen;
    } else if (BASE_TREE_COLOR == "blacksilver"){
      nodeColorFunc = xstnt.Colors.randomGrey;
    } else if (BASE_TREE_COLOR == "silverblack"){
      nodeColorFunc = xstnt.Colors.randomBlack;
    }

    for ( i = 0; i < cylGeom.faces.length; i += 2 ) {    
      hex = xstnt.Colors.parseHex(cylinderColorFunc.apply());
      cylGeom.faces[ i ].color.setHex( hex );
      cylGeom.faces[ i + 1 ].color.setHex( hex );
    }

    for ( i = 0; i < sphGeom.faces.length; i += 2 ) {   
      hex = xstnt.Colors.parseHex(nodeColorFunc.apply());
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

    return( branch );
}

function spreadBranches(){
  /*
  for(var i=0; i<branches.length; i++){
    for(var j=i+1; j<branches.length; j++){
      if(branches[j].)
  }
*/
}

function buildTree(treeData,branchLength,depth){

  //console.log("building tree with "+treeData.length+" branches.");
  var fanRads = de2ra(ANGLE_MIN + Math.random()*(ANGLE_MAX - ANGLE_MIN));

  var root = buildBranch(branchLength, depth);

  for(var i=0; i<treeData.length; i++){
    var newBranch = buildTree(treeData[i], branchLength*LENGTH_MULT, depthOfArray(treeData[i]));
    newBranch.rotation.x = root.rotation.x + (Math.random()*fanRads) - fanRads/2;
    newBranch.rotation.z = root.rotation.z + (Math.random()*fanRads) - fanRads/2;
    newBranch.position.y = -0.05;

    root.tip.add(newBranch);
  }

  return root;
  
}


function buildScene(){
  scene.remove(tree);
  _data = [];

  while(_data.length == 0) {
    _data = randomTreeData();
  }

  treeDepth = depthOfArray(_data);


  var tree = buildTree(_data,BRANCH_LENGTH,treeDepth); 
  tree.position.y = -2;
  scene.add(tree);
}

buildScene();
renderScene();


/////////////////////////////////////////
// Render Loop
/////////////////////////////////////////

function renderScene() {
  renderer.render( scene, camera );
}

// Render the scene when the controls have changed.
// If you don’t have other animations or changes in your scene,
// you won’t be draining system resources every frame to render a scene.
controls.addEventListener( 'change', renderScene );

// Avoid constantly rendering the scene by only 
// updating the controls every requestAnimationFrame
function animationLoop() {
  requestAnimationFrame(animationLoop);
  controls.update();
  //renderScene();
}

animationLoop();


/////////////////////////////////////////
// Window Resizing
/////////////////////////////////////////

window.addEventListener( 'resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    renderScene();
}, false );


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