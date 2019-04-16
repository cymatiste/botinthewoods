 function Meshes(options) {
    //### Make random more readable #########################################3

    var _this = this;
    var THREE = require('three');
    var Randoms = require('./Randoms.js');
    var Colors = require('./Colors.js');

    var _c = new Colors();
    var _r = new Randoms();

    var _rainbow = options.RAINBOW;

    _this.circleMesh = function(col, radius) {

        var geometry = new THREE.CircleGeometry(radius, 8);
        var material = new THREE.MeshBasicMaterial({
            //color: _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(col)
            color: _c.parseHex(col)
        });

        return new THREE.Mesh(geometry, material);
    }

    _this.sphereMesh = function(col, radius){
        var sphGeom = new THREE.SphereGeometry(radius, 2, 2);
        var hex;

        for (i = 0; i < sphGeom.faces.length; i += 2) {
            //hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(col);
            hex = _c.parseHex(col);
            sphGeom.faces[i].color.setHex(hex);
            sphGeom.faces[i + 1].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });

        return new THREE.Mesh(sphGeom, material);
    }
 
    _this.diamondMesh = function(col, width, length){
        var geom = new THREE.Geometry(); 
        var v1 = new THREE.Vector3(0,0,0);
        var v2 = new THREE.Vector3(-width/2,length/4,0);
        var v3 = new THREE.Vector3(0,length,0);
        var v4 = new THREE.Vector3(width/2,length/4,0);


        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);

        geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

        var hex;

        for (i = 0; i < geom.faces.length; i ++) {
            //hex = _rainbow ? _c.parseHex(_c.randomHex()) : _c.parseHex(col);
            hex = _c.parseHex(col);
            geom.faces[i].color.setHex(hex);
        }

        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });
        
       return new THREE.Mesh( geom, material );
    } 
}

module.exports = Meshes;
