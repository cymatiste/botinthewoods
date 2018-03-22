/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////

var scene,
    camera,
    renderer,
    controls;


var _data = randomTreeData();
while(_data.length == 0){
  _data = randomTreeData();
}
console.log("DEPTH "+depthOfArray(_data));

scene = new THREE.Scene();


camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = -60;

var aLittleHigherPos = scene.position;
aLittleHigherPos.y -= 12;
camera.lookAt( aLittleHigherPos );



renderer = new THREE.WebGLRenderer({
  alpha: true,
    antialias: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );


/////////////////////////////////////////
// Trackball Controller
/////////////////////////////////////////

controls = new THREE.TrackballControls( camera );
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 3.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = true;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.05;


/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

var ambientLight  = new THREE.AmbientLight( '#EEEEEE' );

scene.add( ambientLight );


/////////////////////////////////////////
// Utilities
/////////////////////////////////////////

var axisHelper = new THREE.AxesHelper( 1.25 );
scene.add( axisHelper );

var branches = [];
var tipPositions = [];

//var b = buildBranch(5);
//scene.add(b);


function randomTreeData(startingStructure, startingDepth){

  var structure = startingStructure || [];
  var depth = startingDepth || 0;

  var MAX_BRANCHES_PER_NODE = 9;

  var branchChance = (0.75 - Math.min(0.5,0.04*depth));
  
  while(structure.length < MAX_BRANCHES_PER_NODE && Math.random() < branchChance){
    //console.log("at depth "+depth+", chance "+branchChance+", branches so far: "+structure.length);
    structure.push(randomTreeData([],depth+1));
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

function buildBranch(baseLength){
    var length = baseLength*(1 + Math.random()*0.4);
    var cylGeom = new THREE.CylinderGeometry( length/20, length/15, length, 8 );
    var sphGeom = new THREE.SphereGeometry(length/25, 8, 8);
    var hex;

    var i;
    for ( i = 0; i < cylGeom.faces.length; i += 2 ) {

      //hex = Math.random() * 0xffffff;
      hex = xstnt.Colors.parseHex(xstnt.Colors.randomGrey());
      cylGeom.faces[ i ].color.setHex( hex );
      cylGeom.faces[ i + 1 ].color.setHex( hex );

    }

    for ( i = 0; i < sphGeom.faces.length; i += 2 ) {

      //hex = Math.random() * 0xffffff;
      hex = xstnt.Colors.parseHex(xstnt.Colors.randomGreen());
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

function buildTree(treeData,branchLength){

  var depth = depth || 0;

  //console.log("building tree with "+treeData.length+" branches.");

  var fanAmt = 30 + Math.random()*90;

  var root = buildBranch(branchLength);

  for(var i=0; i<treeData.length; i++){
    var newBranch = buildTree(treeData[i],branchLength*0.85);
    newBranch.rotation.x = root.rotation.x + (Math.random()*de2ra(fanAmt)) - de2ra(fanAmt/2);
    newBranch.rotation.z = root.rotation.z + (Math.random()*de2ra(fanAmt)) - de2ra(fanAmt/2);

    root.tip.add(newBranch);
  }

  return root;
  
}

var tree = buildTree(_data,5); 
//tree.position.y = -depthOfArray(_data)*5;
scene.add(tree);



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
  renderScene();
  //checkDistance();
  //spreadBranches();
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