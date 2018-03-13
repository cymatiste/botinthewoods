/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////

var scene,
    camera,
    renderer,
    controls;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set(-5, 12, 10);
camera.lookAt( scene.position );

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
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 3.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = true;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.2;


/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

var iphone_color  = '#FAFAFA',
    ambientLight  = new THREE.AmbientLight( '#EEEEEE' ),
    hemiLight     = new THREE.HemisphereLight( iphone_color, iphone_color, 0 ),
    light         = new THREE.PointLight( iphone_color, 1, 100 );

hemiLight.position.set( 0, 50, 0 );
light.position.set( 0, 20, 10 );

scene.add( ambientLight );
scene.add( hemiLight );
scene.add( light );


/////////////////////////////////////////
// Utilities
/////////////////////////////////////////

var axisHelper = new THREE.AxesHelper( 1.25 );
scene.add( axisHelper );

var branches = [];
var tipPositions = [];

for (var i=0; i<2; i++){
  var b = buildBranch(5);
  scene.add(b);
  branches.push(b);
  b.matrixAutoUpdate && b.updateMatrix();
  //console.log(b.tip.position.y);
}

branches[1].rotation.x = de2ra(180);



function checkDistance(){

  var tipPositions = [];
  for (var i=0; i<branches.length; i++){

    branches[i].matrixAutoUpdate && branches[i].updateMatrix();
    branches[i].tip.matrixAutoUpdate && branches[i].tip.updateMatrix();
    
    var unitVector = new THREE.Vector3();

    console.log(branches[i].tip);
    console.log(branches[i].tip.matrixWorld);
    var tipPos = unitVector.setFromMatrixPosition( branches[i].tip.matrixWorld );
    console.log(tipPos);

    tipPositions.push(tipPos);
}

console.log("distance between 0 and 1 is "+tipPositions[0].distanceTo(tipPositions[1]));


}

function buildComplexShape(){

}

function de2ra(degree){
  return degree*(Math.PI/180);
}

function buildBranch(length){
    var cylGeom = new THREE.CylinderGeometry( length/50, length/25, length, 8 );
    var sphGeom = new THREE.SphereGeometry(length/25, 8, 8);


    var i;
    for ( i = 0; i < cylGeom.faces.length; i += 2 ) {

      var hex = Math.random() * 0xffffff;
      cylGeom.faces[ i ].color.setHex( hex );
      cylGeom.faces[ i + 1 ].color.setHex( hex );

    }

    for ( i = 0; i < sphGeom.faces.length; i += 2 ) {

      var hex = Math.random() * 0xffffff;
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

function buildTree(depth){

}



/////////////////////////////////////////
// Render Loop
/////////////////////////////////////////

function renderPhone() {
  renderer.render( scene, camera );
}

// Render the scene when the controls have changed.
// If you don’t have other animations or changes in your scene,
// you won’t be draining system resources every frame to render a scene.
controls.addEventListener( 'change', renderPhone );

// Avoid constantly rendering the scene by only 
// updating the controls every requestAnimationFrame
function animationLoop() {
  requestAnimationFrame(animationLoop);
  controls.update();
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
    renderPhone();
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