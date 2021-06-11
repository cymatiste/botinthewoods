import { statSync } from "fs";
import { join } from "path";
import { execFile } from "child_process";

import gifsicle from "gifsicle";

import Colors from "./Colors";
import randoms from "./Randoms";
import ForestGenerator from "./ForestGenerator";

let numFrames = 100;
const r = new randoms();
const colorHelper = new Colors();
const forestOptions = {
  RAINBOW: false,
  PICO8: false,
  NUM_TREES: r.randomInt(25, 45),
  TREE_TYPE: "deciduous",
  //NIGHT_MODE: true,
  //PATH_MODE: true,
  EFFECT: false,
  MIRROR: Math.random() < 0.02,
  GRASS_DENSITY: r.randomFrom([0, 0, 0, 20, 50, 100, 200])
};

const leafDensity = Math.random() < 0.1 ? 0 : r.randomInt(1, 30);

const branchMaxRad = r.random(0.6, 5);
const maxDepth = r.randomInt(4, 24);
const treeOptions = {
  BRANCH_R_MAX: branchMaxRad,
  //BRANCH_R_MIN: 0.06,
  BRANCH_R_MIN: 0.1,
  BRANCH_L: r.random(8, 24),
  //BRANCH_L: Math.max(maxRad*10,r.random(4, 10)),
  BRANCH_P: r.random(0.65, 0.95),
  //CHANCE_DECAY: r.random(0.003, 0.025),
  CHANCE_DECAY: r.random(0.001, 0.02),
  LENGTH_MULT: r.random(0.88, 0.98),
  ANGLE_MIN: r.random(15, 50),
  ANGLE_MAX: r.random(70, 120),
  RAINBOW: false, //Math.random() > 0.9,

  //COLOR_TOP: "#AA88FF",
  //COLOR_BTM: "#221122",

  // COLOR_TOP: c.randomHex(),
  //COLOR_BTM: c.brightenByAmt(c.randomHex(),-100),
  //LEAF_COLS: ["#FFCC00","#EEEE44","#FF0055","#EE9922","#EE0505","#DD4400","#FF9977","#BEB344"],
  //LEAF_COLS: ["#2A141D","#1B0005","#2A2B05","#161102","#231313","#0F0F1B","#181D11","#4E430F"],
  //LEAF_SIZE: branchMaxRad*0.6,
  //LEAF_DENSITY: r.randomInt(15,35),
  // LEAF_W: r.random(0.7,1),
  MAX_DEPTH: maxDepth,
  // MAX_BRANCHES_TOTAL: 999,
  MAX_BRANCHES_PER_NODE: Math.random() < 0.1 ? 3 : 2,
  MUSHROOMS: Math.random() < 0.4
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
