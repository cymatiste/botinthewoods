"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const Randoms_1 = require("./Randoms");
const Colors_1 = require("./Colors");
class Meshes {
    constructor(options) {
        this.options = options;
        this.c = new Colors_1.default();
        this.r = new Randoms_1.default();
        this.rainbow = options.RAINBOW;
    }
    circleMesh(col, radius) {
        const geometry = new THREE.CircleGeometry(radius, 8);
        const material = new THREE.MeshBasicMaterial({
            //color: this.rainbow ? this.c.parseHex(this.c.randomHex()) : this.c.parseHex(col)
            color: this.c.parseHex(col)
        });
        return new THREE.Mesh(geometry, material);
    }
    sphereMesh(col, radius, segments) {
        const segs = segments || 2;
        const sphGeom = new THREE.SphereGeometry(radius, segs, segs);
        let hex;
        for (let i = 0; i < sphGeom.faces.length; i += 2) {
            //hex = this.rainbow ? this.c.parseHex(this.c.randomHex()) : this.c.parseHex(col);
            hex = this.c.parseHex(col);
            sphGeom.faces[i].color.setHex(hex);
            sphGeom.faces[i + 1].color.setHex(hex);
        }
        const material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });
        return new THREE.Mesh(sphGeom, material);
    }
    diamondMesh(col, width, length) {
        const geom = new THREE.Geometry();
        const v1 = new THREE.Vector3(0, 0, 0);
        const v2 = new THREE.Vector3(-width / 2, length / 4, 0);
        const v3 = new THREE.Vector3(0, length, 0);
        const v4 = new THREE.Vector3(width / 2, length / 4, 0);
        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);
        geom.faces.push(new THREE.Face3(0, 1, 2));
        let hex;
        for (let i = 0; i < geom.faces.length; i++) {
            //hex = this.rainbow ? this.c.parseHex(this.c.randomHex()) : this.c.parseHex(col);
            hex = this.c.parseHex(col);
            geom.faces[i].color.setHex(hex);
        }
        const material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            overdraw: 0.5
        });
        return new THREE.Mesh(geom, material);
    }
}
exports.default = Meshes;
