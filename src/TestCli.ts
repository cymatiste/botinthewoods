import { statSync } from "fs";
import { join } from "path";
import { execFile } from "child_process";

import gifsicle from "gifsicle";

import Colors from "./Colors";
import Randoms from "./Randoms";
import ForestGenerator from "./ForestGenerator";

let numFrames = 100;
const randoms = new Randoms();
const colorHelper = new Colors();
const forestOptions = {
  RAINBOW: false,
  PICO8: false,
  NUM_TREES: randoms.randomInt(30, 50),
  TREE_TYPE: "deciduous",
  GRASS_DENSITY: randoms.randomInt(30, 90),
  //NIGHT_MODE: true,
  EFFECT: false
};

const treeOptions = {
  BRANCH_R_MAX: randoms.random(0.8, 3),
  BRANCH_R_MIN: 0.06,
  BRANCH_L: randoms.random(8, 15),
  BRANCH_P: 0.72, //randoms.random(0.64, 0.72),
  CHANCE_DECAY: 0.005,
  LENGTH_MULT: randoms.random(0.85, 0.95),
  ANGLE_MIN: randoms.random(15, 35),
  ANGLE_MAX: randoms.random(60, 80),
  RAINBOW: false,
  COLOR_INTENSE: true,
  //COLOR_TOP: colorHelper.randomHex(),
  //COLOR_BTM: colorHelper.brightenByAmt(colorHelper.randomHex(),-130),
  //LEAF_COLS: ["#FFCC00","#EEEE44","#FF0055","#EE9922","#EE0505","#DD4400","#FF9977","#BEB344"],
  //LEAF_COLS: ["#2A141D","#1B0005","#2A2B05","#161102","#231313","#0F0F1B","#181D11","#4E430F"],
  //LEAF_SIZE: 2,//_pickLeafSize(),
  LEAF_DENSITY: 30, //randoms.randomInt(10, 20),
  LEAF_W: randoms.random(1, 3),
  MAX_DEPTH: 15,
  MAX_BRANCHES_TOTAL: 999,
  MAX_BRANCHES_PER_NODE: 2
};

function newForest(numFrames) {
  let gen = new ForestGenerator(forestOptions, treeOptions);

  // Make the GIF
  const filename = "test" + Math.floor(Math.random() * 999999);
  console.log("plz generate " + filename);
  gen = new ForestGenerator(forestOptions, treeOptions);
  return gen.generateSceneGIF(numFrames, filename);
}

function optimize(filename) {
  const sizeLimit = 1048576 * 5;
  const fileSizeInBytes = statSync(filename).size;
  if (fileSizeInBytes > sizeLimit) {
    execFile(gifsicle, ["-o", filename + ".gif", filename + ".gif"], err => {
      console.log("optimized " + filename + ", " + fileSizeInBytes + " bytes.");
    });
  } else {
    console.log("wrote " + filename + ", " + fileSizeInBytes + " bytes.");
  }

  return filename;
}

/**
 * usage: node test 50 100
 * first param:  number of trees
 * second param: number of frames
 *
 */
process.argv.forEach((val, index) => {
  console.log("val " + index + ": " + val);
  if (index == 2) {
    forestOptions.NUM_TREES = Number(val);
    console.log("NUM_TREES: " + forestOptions.NUM_TREES);
  } else if (index == 3) {
    numFrames = Number(val);
    console.log("numFrames: " + numFrames);
  }
});

newForest(numFrames);
