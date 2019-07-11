import { writeFileSync, createWriteStream } from "fs";
import { PNG } from "pngjs";
import * as THREE from "three";
import * as omggif from "omggif";
import * as perlin from "perlin-noise";
import * as SoftwareRenderer from "three-software-renderer";

import Colors from "./Colors";
import Randoms from "./Randoms";
import DeciduousTrees from "./DeciduousTrees";
import ConiferousTrees from "./ConiferousTrees";
// import Moon from './Moon'

export default class ForestGenerator {
  /*
      
      
    n o d e    v e r s i o n
           of threejs tree generator

           by Sarah Imrisek in 2018

    */

  NIGHT_MODE;

  c = new Colors();
  r = new Randoms();

  forest;
  filename;
  palette: string[] = [];

  rainbow;

  GROUNDLEAF_WIDTH = this.r.random(0.3, 0.8);

  NUM_FRAMES = 100;

  NUM_TREES;
  trees: any[] = [];

  SKY_COL;
  GROUND_COL;
  GROUND_COLS;
  VEG_COLS;
  FLOWER_COLS;
  STONE_COLS;

  RIDGE_Z1 = 700;
  RIDGE_Z2 = 800;

  decid;
  conif;

  PATH_MODE;

  //moon = new Moon();

  noise = perlin.generatePerlinNoise(1000, 1000);
  // TODO This only had the second parameter, so I assume it was meant to start from 0 and added that
  startingNoise = this.r.randomInt(this.noise.length / 2);

  controls;

  sceneWidth = 600;
  sceneHeight = 600;

  // When generating twitter headers
  //sceneWidth = 1800;
  //sceneHeight = 1000;

  pixelRatio = 1;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    this.sceneWidth / this.sceneHeight,
    1,
    1500
  );

  aLittleHigherPos = this.scene.position;

  renderer = new SoftwareRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
  });

  ambientLight = new THREE.AmbientLight("#FFFFFF");

  branches = [];
  tipPositions = [];

  constructor(public forestOptions, public treeOptions) {
    this.forestOptions = forestOptions;
    this.treeOptions = treeOptions;
    this.NUM_TREES = this.forestOptions.NUM_TREES || this.r.randomInt(50, 200);
    this.NIGHT_MODE = this.forestOptions.NIGHT_MODE || Math.random() < 0.25;
    this.treeOptions.NIGHT_MODE = this.NIGHT_MODE;
    this.rainbow = this.forestOptions.RAINBOW;

    if (this.forestOptions.PATH_MODE != undefined) {
      this.PATH_MODE = this.forestOptions.PATH_MODE;
      console.log("as provided, PATH_MODE = " + this.PATH_MODE);
    } else {
      this.PATH_MODE = Math.random() < 0.2;
      console.log("NO data provided, PATH_MODE = " + this.PATH_MODE);
    }

    this.decid = new DeciduousTrees(this.treeOptions);
    this.conif = new ConiferousTrees(this.treeOptions);

    this.initColors();

    this.camera.position.x = 0;
    this.camera.position.y = 3;
    this.camera.position.z = -60;

    this.aLittleHigherPos.y = 6;

    this.camera.lookAt(this.aLittleHigherPos);

    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.sceneWidth, this.sceneHeight);

    this.scene.add(this.ambientLight);
  }

  /**
   * What radius should we use for creating leaves?
   * ---------------------------------------------------------
   * @return {Number}
   */
  pickLeafSize() {
    const sizeRange = Math.random();
    if (sizeRange < 0.33) {
      return this.r.random(0.15, 0.4);
    } else if (sizeRange < 0.7) {
      return this.r.random(0.4, 0.8);
    } else if (sizeRange < 0.9) {
      return this.r.random(0.8, 1);
    } else {
      return this.r.random(1, 1.4);
    }
  }

  /**
   * Pick the colors that will form the basic palette for the scene.
   * ---------------------------------------------------------------------
   * @return {void}
   */
  initColors() {
    // The sky and ground are a pastel blue and a muddy green, randomly permuted
    //SKY_COL = NIGHT_MODE ? (_decid.options.RAINBOW? _c.variationsOn("#222222", 20) : _c.variationsOn("#4d6876", 120)) : (_decid.options.RAINBOW? _c.variationsOn("#F0F0F0", 50) : _c.variationsOn("#bdeff1", 150));
    //GROUND_COL = NIGHT_MODE ? (_decid.options.RAINBOW? _c.variationsOn("#111111", 30) : _c.variationsOn("#40523c", 80)) : _c.brightenByAmt(_c.variationsOn("#78836e", 150),_r.randomInt(-25,-75));
    this.SKY_COL = this.NIGHT_MODE
      ? this.c.variationsOn("#4d6876", 120)
      : this.c.variationsOn("#bdeff1", 150);

    this.GROUND_COL = this.NIGHT_MODE
      ? this.c.variationsOn("#40523C", 80)
      : this.c.variationsOn("#20321C", 80);

    // There are leaves on the ground too.  They match the ground, which varies slightly.
    // And flowers!  Which could be any colour.
    this.GROUND_COLS = [];
    this.VEG_COLS = [];
    this.FLOWER_COLS = [];
    this.STONE_COLS = [];

    const vegBase = this.NIGHT_MODE
      ? this.GROUND_COL
      : this.c.brightenByAmt(this.GROUND_COL, this.r.random(-30, 10));

    const stoneGrey = this.c.greyHex(
      this.NIGHT_MODE ? this.r.randomInt(20, 60) : this.r.randomInt(90, 130)
    );

    let stoneBase = this.c.mixHexCols(stoneGrey, this.GROUND_COL, 0.7, 0.3);
    stoneBase = this.c.mixHexCols(stoneBase, this.SKY_COL, 0.8, 0.2);
    // just one colour for the path actually, it's too sparkly otherwise
    this.STONE_COLS[0] = stoneBase;

    for (let i = 0; i < 8; i++) {
      this.GROUND_COLS.push(this.c.variationsOn(this.GROUND_COL, 20));
      this.VEG_COLS.push(this.c.variationsOn(vegBase, 40));
    }
  }

  /**
   * We need to pick 256 colors in the scene to use for the GIF.
   * -------------------------------------------------------------------
   * @param  {Array} pal  - an array of starting hex colors to use
   *
   * @return {Array}      - the completed array of 256 colors
   */
  makePaletteFromScene(pal) {
    // these are the pixels we're going to work with
    const firstsnap = this.renderer.render(this.scene, this.camera);
    const picoPalette = this.c.pico8HexColors();

    if (this.forestOptions.PICO8) {
      //for(let i=picoPalette.length; i<256; i++) {
      //  pal.push(this.c.parseHex(this.c.variationsOn(picoPalette[i%16], 15)));
      //}
    }

    const eightbitbuffer = this.convertRGBAto8bit(firstsnap.data, pal);

    // If we didn't need all 256 colors, fine, just fill up the rest so the GIFmaker doesn't break.
    while (pal.length < 256) {
      pal.push(this.c.parseHex(this.c.variationsOn(this.GROUND_COL, 15)));
    }

    return pal;
  }

  dirtPath() {
    const path = new THREE.Object3D();
    const stepSize = 0.5;
    const currentPoint = new THREE.Vector3(0, 0, -30);
    const wending = this.r.random(1, 3);
    const clusterSpread = this.r.random(1, 6);

    for (let i = 0; i < 400 / stepSize; i++) {
      const numStonesInCluster = this.r.random(10, 20);
      const clusterRadius = this.r.random(1, 5);
      const minSize = 0.1,
        maxSize = 0.7;

      const cluster = new THREE.Object3D();
      for (let s = 0; s < numStonesInCluster; s++) {
        const stoneX = this.r.random(-clusterRadius, clusterRadius);

        const stoneSize =
          minSize +
          maxSize * ((clusterRadius - Math.abs(stoneX)) / clusterRadius);

        const stone = this.buildStone(this.STONE_COLS[0], stoneSize);
        stone.position.x = stoneX;
        stone.position.z = this.r.random(-clusterRadius, clusterRadius);

        cluster.add(stone);
      }

      cluster.position.x =
        clusterSpread * this.noise[Math.floor(i / wending)] - clusterSpread / 2;

      cluster.position.z = currentPoint.z + i * stepSize;
      //clusterWrapper.rotation.y = this.perlinRotation(i);
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
  makeGIF() {
    const gifData = [];

    this.palette = this.makePaletteFromScene(this.palette);

    const gifBuffer = new Buffer(
      this.sceneWidth * this.sceneHeight * this.NUM_FRAMES
    );
    const gif = new omggif.GifWriter(
      gifBuffer,
      this.sceneWidth,
      this.sceneHeight,
      {
        palette: this.palette,
        loop: 0
      }
    );

    const y_axis = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < this.NUM_FRAMES; i++) {
      // output progress tracked in the console soothes my anxiety!
      console.log(i);

      // simulate walking through the forest by steadily moving forward,
      // and rotating the scene with perlin noise.
      this.forest.position.z -= 0.5;
      const wobble = this.perlinRotation(i);
      this.forest.rotation.y += wobble;

      const pixels = this.renderer.render(this.scene, this.camera);
      const frameData = this.convertRGBAto8bit(pixels.data, this.palette);

      gif.addFrame(0, 0, pixels.width, pixels.height, frameData);

      /*
            if(_rainbow && i%5==0){
                SKY_COL = _c.randomHex();
                GRND_COL = _c.randomHex();
            }
            */
    }

    const id = this.r.randomInt(0, 9999999);

    writeFileSync(
      "./images/" + this.filename + ".gif",
      gifBuffer.slice(0, gif.end())
    );

    console.log("wrote " + this.filename + ".gif");

    return this.filename;
  }

  perlinRotation(index) {
    return (this.noise[index + this.startingNoise] - 0.5) / 150;
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
  savePNG(pixelData, width, height) {
    const png = new PNG({
      width: width,
      height: height,
      filterType: -1
    });

    for (let i = 0; i < pixelData.length; i++) {
      png.data[i] = pixelData[i];
    }

    png.pack().pipe(createWriteStream("./images/" + this.filename + ".png"));
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
  convertRGBAto8bit(rgbaBuffer, palette) {
    const outputBuffer = new Uint8Array(rgbaBuffer.length / 4);

    const bgBuffer = [];

    // We're going to add some stripes for a very primitive gradient where the sky meets the ground.
    let skyColInt = this.c.parseHex(this.SKY_COL);
    let grndColInt = this.c.parseHex(this.GROUND_COL);
    let blend0 = this.c.parseHex(
      this.c.mixHexCols(this.SKY_COL, this.GROUND_COL, 0.9, 0.1)
    );
    let blend1 = this.c.parseHex(
      this.c.mixHexCols(this.SKY_COL, this.GROUND_COL, 0.7, 0.3)
    );
    let blend2 = this.c.parseHex(
      this.c.mixHexCols(this.SKY_COL, this.GROUND_COL, 0.5, 0.5)
    );
    let blend3 = this.c.parseHex(
      this.c.mixHexCols(this.SKY_COL, this.GROUND_COL, 0.3, 0.7)
    );

    for (let i = 0; i < rgbaBuffer.length; i += 4) {
      let color =
        (rgbaBuffer[i] << 16) + (rgbaBuffer[i + 1] << 8) + rgbaBuffer[i + 2];

      // stripes
      // big fat ones: i%65000
      if (this.rainbow && i % this.r.random(0, 9999) == 0) {
        skyColInt = this.c.parseHex(this.c.randomHex());
        grndColInt = this.c.parseHex(this.c.randomHex());
        blend0 = this.c.parseHex(this.c.randomHex());
        blend1 = this.c.parseHex(this.c.randomHex());
        blend2 = this.c.parseHex(this.c.randomHex());
        blend3 = this.c.parseHex(this.c.randomHex());
      }

      // buffer.length/skyline = the line on the image where the ground begins.
      const skyline = 1.75;

      // if this pixel is transparent, let's fill in a background.
      if (rgbaBuffer[i + 3] == 0 && color == 0) {
        if (i < rgbaBuffer.length / (skyline + 0.5)) {
          color = skyColInt;
        } else if (i < rgbaBuffer.length / (skyline + 0.1)) {
          color = blend0;
        } else if (i < rgbaBuffer.length / skyline) {
          color = blend1;
        } else if (i < rgbaBuffer.length / (skyline - 0.1)) {
          color = blend2;
        } else if (i < rgbaBuffer.length / (skyline - 0.15)) {
          color = blend3;
        } else {
          color = grndColInt;
        }
      }

      if (i > 8 && this.forestOptions.EFFECT) {
        //outputBuffer = this.staticEffect(i,outputBuffer);
        const effectSpacing = this.r.randomInt(8, 11);
        const lastPixel = palette[outputBuffer[(i - 4) / 4]];
        const prevPixel = palette[outputBuffer[(i - 8) / 4]];
        //console.log(lastPixel+", "+prevPixel);
        if (i % effectSpacing < 2 && lastPixel != prevPixel) {
          //color = this.c.hexToInt(this.c.addHexCols(lastPixel,prevPixel));
          color = this.c.hexToInt(this.c.randomHex());
        }
      }

      let foundCol = false;
      for (let p = 0; p < palette.length; p++) {
        // Oh we have this color already, excellent.
        if (color == palette[p]) {
          foundCol = true;
          outputBuffer[i / 4] = p;
          break;
        }
      }

      if (!foundCol && palette.length < 256) {
        // Don't know this color yet but there's still room to add it.
        palette.push(color);
        outputBuffer[i / 4] = palette.length - 1;
      } else if (!foundCol) {
        // This is a new color we don't have room to add. We'll approximate it
        // to the closest color we already have in the palette.
        let lowestDiff = 0xffffff * 10;
        let closestCol = 0xffffff;
        let closestIndex = -1;

        for (let pp = 0; pp < palette.length; pp++) {
          let paletteInt = palette[pp];
          let colorInt = color;
          let colorDiff = Math.abs(colorInt - paletteInt);

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

  staticEffect(i, outputBuffer) {
    if (i % this.r.randomInt(12, 13) < this.r.randomInt(4)) {
      const skipBack = this.r.randomInt(10) * 4;

      if (i > skipBack) {
        outputBuffer[i / 4] = outputBuffer[(i - skipBack) / 4];
      }
    }

    return outputBuffer;
  }

  buildLeaf(leafCol, leafSize, leafWidth) {
    const leaf = this.circleMesh(leafCol, leafSize);
    leaf.scale.x = leafWidth;
    return leaf;
  }

  circleMesh(col, radius, opacity?) {
    const geometry = new THREE.CircleGeometry(radius, 8);
    const material = new THREE.MeshLambertMaterial({
      color: this.rainbow
        ? this.c.parseHex(this.c.randomHex())
        : this.c.parseHex(col),
      transparent: true
    });

    material.opacity = opacity;

    return new THREE.Mesh(geometry, material);
  }

  hemisphereMesh(col, radius) {
    const sphGeom = new THREE.SphereGeometry(
      radius,
      5,
      4,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );

    const hex = this.rainbow
      ? this.c.parseHex(this.c.randomHex())
      : this.c.parseHex(col);

    for (let i = 0; i < sphGeom.faces.length; i++) {
      sphGeom.faces[i].color.setHex(hex);
    }

    const material = new THREE.MeshBasicMaterial({
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
  buildHill(size, col) {
    const hill = this.circleMesh(col, size);
    hill.rotation.x = -Math.PI;

    return hill;
  }

  bushColors() {
    const cols: string[] = [];

    let bushBase = this.c.mixHexCols(
      this.c.randomHex(),
      this.decid.options.COLOR_BTM,
      0.3,
      0.7
    );

    bushBase = this.c.mixHexCols(bushBase, this.GROUND_COL, 0.4, 0.6);

    for (let i = 0; i < 4; i++) {
      cols.push(this.c.variationsOn(bushBase, 20));
    }

    return cols;
  }

  bush(height, width, colors, leafSize) {
    const bush = new THREE.Object3D();

    for (let i = 0; i < height * 4; i++) {
      const clump = new THREE.Object3D();
      this.makeLeavesAround(
        clump,
        this.r.randomInt(20, 40),
        colors,
        leafSize,
        0,
        0,
        leafSize
      );

      clump.position.x = this.r.random(-width, width);
      clump.position.z = this.r.random(-width, width);
      //clump.position.y = i*0.2;

      // shaping this into a rough upside down parabola
      clump.position.y = this.r.random(
        0,
        height * 0.7 -
          (Math.abs(clump.position.x) * Math.abs(clump.position.x)) / 32
      );
      bush.add(clump);
    }

    bush.position.y = -0.5;
    bush.scale.x = bush.scale.y = bush.scale.z = this.r.random(1, 1.5);

    return bush;
  }

  buildRocks() {
    const numRocks = this.r.randomInt(this.NUM_TREES * 2, this.NUM_TREES * 4);
    const baseGrey = this.c.greyHex(
      this.NIGHT_MODE ? this.r.randomInt(10, 50) : this.r.randomInt(30, 100)
    );
    const rockCol = this.c.mixHexCols(this.GROUND_COL, baseGrey, 0.6, 0.4);

    console.log("[) " + numRocks);
    for (let i = 0; i < numRocks; i++) {
      const rockRad = this.r.random(0.1, 3);
      const rock = this.hemisphereMesh(rockCol, rockRad);

      //rock.position.y = -rockRad*0.6;
      rock.scale.y = this.r.random(0.1, 0.8);
      rock.scale.x = this.r.random(0.5, 1);
      rock.position.z = this.r.random(-30, 200);
      rock.position.x = this.r.randomSign(this.r.random(3, 40 + i));
      rock.rotation.y = this.r.random(0, Math.PI * 2);

      this.forest.add(rock);
    }
  }

  buildBushes() {
    const bushHeight = this.r.random(0.4, 1);
    const bushWidth = this.r.randomInt(4, 12);
    const numBushes = Math.min(30, this.r.randomInt(30, this.NUM_TREES));
    const bushColors = this.bushColors();
    const leafSize = this.r.random(
      this.decid.options.LEAF_SIZE,
      this.decid.options.LEAF_SIZE * 2
    );
    const leafWidth = this.r.random(0.7, 1);

    const backBushCols: any[] = [];
    if (this.rainbow) {
      backBushCols.push(
        this.c.brightenByAmt(bushColors[0], this.r.random(-100, -40))
      );
    } else {
      for (let i = 0; i < bushColors.length; i++) {
        backBushCols.push(
          this.c.brightenByAmt(bushColors[i], this.r.random(-10, 10))
        );
      }
    }

    console.log("{}{} " + numBushes);

    for (let i = 0; i < numBushes; i++) {
      //console.log("bush "+i);
      const newBush = this.bush(
        this.r.random(bushHeight * 0.5, bushHeight * 1.2),
        bushWidth,
        bushColors,
        leafSize
        // leafWidth TODO this.bush only supports 4 parameters
      );

      newBush.position.z = this.r.random(-30, 200);
      newBush.position.x = this.r.randomSign(this.r.random(4, 40 + i));
      newBush.position.y = 1;

      this.forest.add(newBush);
    }

    const numBackBushes = Math.max(60, this.NUM_TREES * 0.6);
    for (let i = 0; i < this.NUM_TREES * 0.6; i++) {
      const newBush = this.bush(
        this.r.random(bushHeight * 50, bushHeight * 80),
        bushWidth * 8,
        backBushCols,
        leafSize * 4
        // leafWidth * 4 TODO this.bush only supports 4 parameters
      );

      newBush.position.z = this.r.random(this.RIDGE_Z1, this.RIDGE_Z2);
      newBush.position.x = this.r.randomSign(this.r.random(0, 300));
      newBush.position.y = -10;

      this.forest.add(newBush);
    }
  }

  flowerColors() {
    const cols: any[] = [];
    let flowerBase = this.c.randomHex();

    if (this.NIGHT_MODE) {
      flowerBase = this.c.brightenByAmt(flowerBase, -100);
    }

    for (let i = 0; i < 4; i++) {
      cols.push(this.c.variationsOn(flowerBase, 50));
    }
    return cols;
  }

  flowers() {
    const flowerCols = this.flowerColors();
    const numFlowers = this.r.randomInt(50, 350);
    const newPath = new THREE.Object3D();
    const petalNum = this.r.randomInt(3, 8);
    const basePetalSize = this.r.random(0.6, 1);

    const startZ = this.r.random(0, 30);
    const zSpread = this.r.random(0, 20);
    const startX = this.r.random(-20, 20);
    const xSpread = 40;

    for (let i = 0; i < numFlowers; i++) {
      const petalSize = basePetalSize * this.r.random(0.2, 0.5);
      const variedCol = this.r.randomFrom(flowerCols);

      const flowerCol = variedCol;
      const petalAngle = Math.PI * this.r.random(1.25, 1.5);
      const f = this.flower(petalNum, flowerCol, petalSize, petalAngle);

      f.position.z =
        startZ + i * this.r.random(-zSpread / 3, zSpread * (2 / 3));
      f.position.x = startX + this.r.random(-xSpread / 2, xSpread / 2);
      f.position.y = this.r.random(0, 0.3);

      f.rotation.x += this.r.random(-0.3, 0.3);
      f.rotation.z += this.r.random(-0.3, 0.3);
      f.scale.x = f.scale.y = f.scale.z = this.r.random(0.5, 1);
      //f.position.y = 5;

      newPath.add(f);
    }

    console.log("@@@, " + numFlowers + " flowers, " + petalNum + " petals");
    return newPath;
  }

  flower(numPetals, col, petalSize, petalAngle) {
    //console.log("flower: "+numPetals+", "+col+", "+petalSize);
    const flower = new THREE.Object3D();

    for (let i = 0; i < numPetals; i++) {
      const pivot = new THREE.Object3D();
      const petal = this.circleMesh(col, petalSize);

      petal.rotation.x = petalAngle;

      petal.position.z = petalSize / 1.5;
      petal.scale.x = 2 / numPetals;
      pivot.add(petal);
      pivot.position.y = 1.1;

      //petal.rotation.z = this.de2ra(30);

      pivot.rotation.y = i * this.de2ra(360 / numPetals);

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
  de2ra(degree) {
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
  makeLeavesAround(
    obj3d,
    numLeaves,
    colors,
    leafRadius,
    yAdjust,
    rAdjust,
    leafWidth
  ) {
    for (let i = 0; i < numLeaves; i++) {
      const leaf_col = this.r.randomFrom(colors);
      const newLeaf = this.buildLeaf(leaf_col, leafRadius, leafWidth);

      newLeaf.position.y += this.r.random(0, 2) + yAdjust;
      newLeaf.position.x += this.r.randomSign(this.r.random(0.75) + rAdjust);
      newLeaf.position.z += this.r.randomSign(this.r.random(0.75) + rAdjust);

      newLeaf.rotation.x = this.r.random(-Math.PI / 2, Math.PI);
      newLeaf.rotation.y = this.r.random(-Math.PI / 2, Math.PI);
      newLeaf.rotation.z = this.r.random(-Math.PI / 2, Math.PI);

      obj3d.rotation.y += (Math.PI * 2) / numLeaves;

      obj3d.add(newLeaf);
    }
  }

  /**
   * Fluffy round clouds in the sky
   * ------------------------------------
   * @return {void}
   */
  buildClouds() {
    const numClumps = this.r.randomInt(7);

    const cloudMaxRad = 400;
    const thinness = 0.08;

    for (let i = 0; i < numClumps; i++) {
      const cloudsPerClump = 3 + this.r.randomInt(12);

      const clumpCenterX = this.r.randomInt(-250, 250);
      const clumpCenterY = this.r.random(160, 700);
      const cloudCol = this.c.brightenByAmt(this.SKY_COL, this.r.randomInt(30));

      console.log(
        "clump " +
          i +
          ": " +
          cloudsPerClump +
          " clouds around " +
          clumpCenterX +
          ", " +
          clumpCenterY
      );

      for (let j = 0; j < cloudsPerClump; j++) {
        const cloud = this.circleMesh(
          cloudCol,
          this.r.random(cloudMaxRad, 0.5)
        );
        cloud.rotation.x = -Math.PI;
        cloud.scale.y = this.r.random(thinness);
        cloud.scale.x = this.r.random(0.3, 0.7);
        // darker clouds in the background please
        cloud.position.z = 700 + (255 - this.c.valueOfHexCol(cloudCol));
        const y_adj = cloudMaxRad * thinness * 1.5;
        cloud.position.y = clumpCenterY + this.r.random(-y_adj / 2, y_adj / 2);
        cloud.position.x =
          clumpCenterX + this.r.random(-cloudMaxRad / 4, cloudMaxRad / 4);
        this.forest.add(cloud);
      }
    }
  }

  /**
   * Build and position a bunch of trees in front of the camera to give the impression of a full surrounding forest.
   * Also some ground vegetation, why not.
   * -------------------------------------------------------------------------------------------------------------------
   * @return {void}
   */

  buildForest() {
    const numTrees = this.r.randomInt(
      this.NUM_TREES * 0.5,
      this.NUM_TREES * 1.5
    );
    const groundLeafSize = this.pickLeafSize();
    const farEdge = this.r.random(600, 900);
    const zInterval = farEdge / this.NUM_TREES;
    const xInterval = this.r.random(200, 350) / this.NUM_TREES;

    //Ground
    const planeGeom = new THREE.SphereGeometry(500, 32, 32);
    const planeMat = new THREE.MeshBasicMaterial({
      color: this.c.parseHex(this.GROUND_COL)
    });
    const planeSphere = new THREE.Mesh(planeGeom, planeMat);
    planeSphere.position.y = -1;
    planeSphere.position.z = 300;
    planeSphere.scale.y = 0.0001;
    this.forest.add(planeSphere);

    let xPositions: any[] = [];
    for (let i = 0; i < this.NUM_TREES * 2; i++) {
      xPositions.push((i % this.NUM_TREES) * xInterval);
    }
    xPositions = this.r.shuffle(xPositions);

    // Trees
    for (let i = 0; i < this.NUM_TREES * 2; i++) {
      // Good to get an idea of how complicated a thing we are building so we know how anxious to
      // get about how long it is taking to generate.
      console.log("tree " + i);

      const treetype =
        this.forestOptions.TREE_TYPE == "coniferous" ? this.conif : this.decid;
      //const treetype = this.conif;

      let newTree, wrappedTree;

      if (i < this.NUM_TREES) {
        // blend in the bottom of the tree with the ground a little
        const groundProp = this.r.randomFrom([
          0,
          0,
          0,
          0,
          0.05,
          0.07,
          0.08,
          0.09,
          0.1,
          0.11,
          0.13
        ]);
        treetype.options.COLOR_BTM = this.c.mixHexCols(
          treetype.options.COLOR_BTM,
          this.GROUND_COL,
          1 - groundProp,
          groundProp
        );
        newTree = treetype.getTree(treetype.options);
        wrappedTree = new THREE.Object3D();
        wrappedTree.add(newTree);
        wrappedTree.rotation.y = this.r.random(Math.PI * 2);
      } else {
        wrappedTree = this.trees[i - this.NUM_TREES].clone(true);
      }
      this.trees.push(wrappedTree);
      // If a tree falls in the forest;

      const atreefalls = Math.random();
      if (atreefalls < 0.01) {
        wrappedTree.rotation.x = Math.PI / 2;
      } else if (atreefalls < 0.1) {
        wrappedTree.rotation.z = Math.PI / 2;
      }
      wrappedTree.rotation.y = Math.random() * Math.PI * 2;

      wrappedTree.position.x = this.r.randomSign(
        xPositions[i] / 2 + (i < 20 ? this.r.random(5, 8) : 0)
      );

      if (i < this.NUM_TREES) {
        // scatter these throughout the field
        wrappedTree.position.z =
          i * zInterval - this.r.random(0, zInterval / 2);

        // Some clumps of vegetation around the base of the trees.
        this.makeLeavesAround(
          newTree,
          8 + this.r.randomInt(24),
          this.VEG_COLS,
          groundLeafSize,
          0,
          this.r.random(
            treetype.options.BRANCH_R_MAX,
            treetype.options.BRANCH_R_MAX * 2 * newTree.scale.x
          ),
          this.GROUNDLEAF_WIDTH
        );
        this.makeLeavesAround(
          newTree,
          8 + this.r.randomInt(24),
          this.VEG_COLS,
          this.pickLeafSize(),
          0,
          this.r.random(
            treetype.options.BRANCH_R_MAX,
            treetype.options.BRANCH_R_MAX * 2 * newTree.scale.x
          ),
          this.GROUNDLEAF_WIDTH
        );
      } else {
        //add the last trees to the bush ridge at the back of the scene
        // don't bother with the ground leaves, we can't see well that far back.
        wrappedTree.position.z = this.r.random(
          farEdge * 0.7,
          this.RIDGE_Z1 * 0.95
        );

        // let's test grouping these all closer.
        wrappedTree.position.x = this.r.randomSign(
          xPositions[i] + (i < 12 ? this.r.random(3, 5) : 0)
        );
      }

      wrappedTree.scale.x = wrappedTree.scale.y = wrappedTree.scale.z = this.r.random(
        0.8,
        1.8
      );

      this.forest.add(wrappedTree);
    }

    // Ground cover
    for (let i = 0; i < this.NUM_TREES * 12; i++) {
      const clump = new THREE.Object3D();
      clump.position.x = this.r.randomSign(this.r.random(3, 40));
      clump.position.z = i + this.r.random(-150, 150);
      this.makeLeavesAround(
        clump,
        this.r.randomInt(0, 15),
        this.VEG_COLS,
        groundLeafSize,
        0,
        0,
        this.GROUNDLEAF_WIDTH
      );
      this.forest.add(clump);
    }
  }

  grassBlade() {
    let grassHeight = this.r.randomInt(5, 8);
    let grassWidth = 0.25;
    let grassCol = this.rainbow
      ? this.c.randomHex()
      : this.c.brightenByAmt(this.r.randomFrom(this.GROUND_COLS), -10);
    let bend = this.r.random(0, 0.1);
    //(baseLength, distanceFromTip, distanceFromRoot, fullTreeDepth, minRad, maxRad)
    const root = this.grassSegment(
      0.01,
      grassHeight,
      0,
      grassHeight,
      grassWidth,
      grassWidth,
      grassCol
    );
    let workingRoot = root;
    for (let i = 0; i < grassHeight; i++) {
      let segment = this.grassSegment(
        this.treeOptions.BRANCH_L / 8,
        grassHeight - i,
        i,
        grassHeight,
        grassWidth * ((grassHeight - (i + 1)) / grassHeight),
        grassWidth * ((grassHeight - i) / grassHeight),
        grassCol
      );

      segment.scale.x = 0.1;
      segment.rotation.x = bend;
      workingRoot.tip.add(segment);
      workingRoot = segment;
    }
    root.rotation.x = this.r.random(-Math.PI / 5, Math.PI / 5);
    root.rotation.y = this.r.random(0, Math.PI * 2);

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
  grassSegment(
    baseLength,
    distanceFromTip,
    distanceFromRoot,
    fullTreeDepth,
    minRad,
    maxRad,
    branchCol
  ) {
    let length = baseLength; // * this.r.random(0.5, 0.7);

    // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
    const referenceLength = Math.min(length, this.treeOptions.BRANCH_L);

    const baseRadius = function(distFromTip, distFromRoot) {
      return minRad + (distFromTip / fullTreeDepth) * (maxRad - minRad);
    };

    if (distanceFromRoot <= 1) {
      length *= 2;
    }

    const radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
    const radiusTop = baseRadius(
      Math.max(0, distanceFromTip - 1),
      distanceFromRoot + 1
    );

    const cylGeom = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      length,
      4
    );
    const sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
    let hex;

    const propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
    const propTop = 1 - propBtm;

    //const branchCol = this.rainbow ? this.c.randomHex() : this.c.mixHexCols(this.r.randomFrom(this.GROUND_COLS), this.r.randomFrom(this.GROUND_COLS), propBtm, propTop);

    for (let i = 0; i < cylGeom.faces.length; i++) {
      hex = this.rainbow
        ? this.c.parseHex(this.c.randomHex())
        : this.c.parseHex(branchCol);
      cylGeom.faces[i].color.setHex(hex);
    }

    for (let i = 0; i < sphGeom.faces.length; i++) {
      hex = this.rainbow
        ? this.c.parseHex(this.c.randomHex())
        : this.c.parseHex(branchCol);
      sphGeom.faces[i].color.setHex(hex);
    }

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });

    const cylinder = new THREE.Mesh(cylGeom, material);
    cylinder.position.y = length / 2;

    //const sphere = new THREE.Mesh(sphGeom, material);

    const tip = new THREE.Object3D();
    tip.position.y = length;
    //tip.add(sphere);

    const branch = new THREE.Object3D();
    branch.add(cylinder);
    branch.add(tip);
    branch.tip = tip;
    branch.length = length;

    //console.log("grass segment l "+length+", minrad "+minRad+" maxrad "+maxRad);
    return branch;
  }

  growGrass() {
    const patchSize = this.forestOptions.GRASS_DENSITY;
    let clusterSize = this.r.random(0, 2);
    let numInCluster = this.r.random(4, 10);
    if (this.forestOptions.GRASS_DENSITY == 0) {
      return;
    }
    for (let i = 0; i < this.trees.length; i++) {
      console.log("grass " + i);

      for (let j = 0; j < patchSize; j += numInCluster) {
        let clumpPos = {
          x: this.trees[i].position.x + this.r.randomSign(this.r.random(0, 40)),
          y: this.trees[i].position.y,
          z: this.trees[i].position.z + this.r.randomSign(this.r.random(0, 40))
        };
        for (let k = 0; k < numInCluster; k++) {
          let blade = this.grassBlade();
          blade.position.x =
            clumpPos.x + this.r.randomSign(this.r.random(0, clusterSize));
          blade.position.y =
            clumpPos.y + this.r.randomSign(this.r.random(0, clusterSize));
          blade.position.z =
            clumpPos.z + this.r.randomSign(this.r.random(0, clusterSize));
          blade.scale.x = blade.scale.y = blade.scale.z = 0.3;
          this.forest.add(blade);
        }

        numInCluster = this.r.randomInt(4, 10);
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
  buildHills() {
    const numHills = this.NUM_TREES;
    const baseScale = this.r.random(2, 4);
    for (let i = 0; i < numHills; i++) {
      const rearHill = i > numHills * 0.9;
      const hillRadius = this.r.randomInt(10, 120);
      const hillColor = this.r.randomFrom(this.GROUND_COLS);
      const hill = this.buildHill(hillRadius, hillColor);

      let xSpread = 50 + i * 10;
      xSpread = i * 10 + hillRadius;

      const zSpread = 600 / numHills;

      hill.scale.y = this.r.random(0.005, 0.3) * baseScale;

      hill.position.z = i * zSpread;
      hill.position.x = this.r.random(-xSpread / 2 - 5, xSpread / 2 + 5);
      //hill.position.y = i * 0.3 - hillRadius * hill.scale.y + (rearHill ? 3 : 0);
      hill.position.y =
        i * 0.2 - hillRadius * hill.scale.y + (rearHill ? 3 : 0);

      this.forest.add(hill);
    }
  }

  buildStone(col, size) {
    const stone = this.circleMesh(col, size);
    stone.rotation.x = -Math.PI / 2;
    return stone;
  }

  buildStar() {
    const starCol = this.c.mixHexCols("#FFFFFF", this.SKY_COL, 0.7, 0.3);
    const star = this.circleMesh(starCol, this.r.random(1, 3));
    star.rotation.x = -Math.PI;
    return star;
  }

  buildStars() {
    const numStars = this.r.random(100, 200);
    const dome = new THREE.Object3D();
    for (let i = 0; i < numStars; i++) {
      const star = this.buildStar();
      dome.add(star);
      star.position.x = this.r.random(-700, 700);
      star.position.y = this.r.random(-700, 700);
    }
    dome.position.z = 1200;
    dome.position.y = 610;
    this.forest.add(dome);
  }

  // TODO this.moon was commented out when I found it
  // buildMoon() {
  //   const moon = this.moon.todaysMoon(this.SKY_COL);
  //   moon.position.z = 1100;
  //   moon.position.y = this.r.random(-700, 600);
  //   this.forest.add(moon);
  // }

  /**
   * Build a scene with trees!  and hills!
   * ---------------------------------------------------------------------------------------------
   * @return {void}
   */
  buildScene() {
    console.log("buildScene");
    this.scene.remove(this.forest);

    this.forest = new THREE.Object3D();
    this.forest.position.y = -20;
    this.forest.position.z = -this.r.random(-20, -40);

    this.buildForest();
    this.buildHills();
    this.buildClouds();
    this.buildBushes();
    this.buildRocks();
    this.growGrass();
    this.forest.add(this.flowers());
    if (this.PATH_MODE) {
      this.forest.add(this.dirtPath());
    }

    if (this.NIGHT_MODE) {
      this.buildStars();
      //this.buildMoon();
    }

    this.scene.add(this.forest);
    this.forest.position.z = this.r.random(-40, -20);
    //this.forest.position.z = -this.r.random(40,80);
  }

  /**
   * Make a scene, turn it into a gif and save it.
   * --------------------------------------------------------------------------------------------
   * @param  {int} numFrames      -- how many frames in the GIF?  (Watch your file size grow!)
   * @param  {string} filename    -- name for the gif
   *
   * @return {string}             -- the filename
   */
  generateSceneGIF(numFrames, filename) {
    this.NUM_FRAMES = numFrames;
    this.filename = filename;
    console.log(
      JSON.stringify(this.forestOptions) +
        "\n" +
        JSON.stringify(this.treeOptions)
    );
    this.buildScene();
    return this.makeGIF();
  }
}
