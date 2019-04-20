import * as fs from "fs";

import * as imagemin from "imagemin";
import * as imageminGiflossy from "imagemin-giflossy";

import Names from "./Names";
import Randoms from "./Randoms";
import Colors from "./Colors";
import ForestGenerator from "./ForestGenerator";

let filename;

const r = new Randoms();
const c = new Colors();
const namer = new Names();

function keepGenerating() {
  // Make the GIF
  //filename = 'forest'+Math.floor(Math.random()*999999);
  filename = namer.getName();
  //console.log("got filename "+filename);
  setTimeout(function() {
    makeForest(filename);
  }, 2000);
}

function makeForest(filename) {
  console.log("generating " + filename);

  const numTrees = r.randomInt(30, 70);
  const forestOptions = {
    RAINBOW: false,
    TREE_TYPE: "deciduous",
    //TREE_TYPE: r.randomFrom(["deciduous","deciduous","coniferous"]),
    NUM_TREES: numTrees,
    //NUM_TREES: 5,
    GRASS_DENSITY:
      numTrees > 45 ? 0 : r.randomFrom([0, 0, 0, 0, 0, 25, 50, 75, 100])
    //GRASS_DENSITY: 0 //r.randomFrom([0,0,0,50])
  };

  const branchMaxRad = r.random(0.6, 1.8);
  const maxDepth = r.randomInt(8, 13);
  const treeOptions = {
    BRANCH_R_MAX: branchMaxRad,
    BRANCH_R_MIN: 0.06,
    BRANCH_L: r.random(5, 15),
    //BRANCH_L: r.random(5,10),
    //BRANCH_L: Math.max(maxRad*10,r.random(4, 10)),
    BRANCH_P: r.random(0.72, 0.77),
    CHANCE_DECAY: r.random(0.01, 0.05),
    //CHANCE_DECAY: pickDecay(),
    LENGTH_MULT: r.random(0.8, 0.95),
    ANGLE_MIN: r.random(15, 30),
    ANGLE_MAX: r.random(60, 90),
    RAINBOW: false,
    // COLOR_TOP: c.randomHex(),
    //COLOR_BTM: c.brightenByAmt(c.randomHex(),-100),
    //LEAF_COLS: ["#FFCC00","#EEEE44","#FF0055","#EE9922","#EE0505","#DD4400","#FF9977","#BEB344"],
    //LEAF_COLS: ["#2A141D","#1B0005","#2A2B05","#161102","#231313","#0F0F1B","#181D11","#4E430F"],
    //LEAF_SIZE: branchMaxRad*0.75,
    //LEAF_DENSITY: r.randomInt(15,35),
    // LEAF_W: r.random(0.7,1),
    MAX_DEPTH: maxDepth,
    // MAX_BRANCHES_TOTAL: 999,
    MAX_BRANCHES_PER_NODE: 3
  };

  const gen = new ForestGenerator(forestOptions, treeOptions);
  //optimize(gen.generateSceneGIF(100, filename),256);
  recordAsTweetable(gen.generateSceneGIF(100, filename));
}

function optimize(filename, paletteSize) {
  filename = filename;
  const sizeLimit = 1048576 * 5;
  const fileSizeInBytes = fs.statSync(filename).size;
  const nextStepDown = Math.floor(paletteSize * 0.9);
  if (fileSizeInBytes > sizeLimit) {
    imagemin(["images/" + filename + ".gif"], "images", {
      use: [imageminGiflossy({ lossy: nextStepDown })]
    }).then(() => {
      optimize(filename, nextStepDown);
    });
  } else {
    recordAsTweetable(filename);
  }

  return filename;
}

function recordAsTweetable(filename) {
  const json = JSON.parse(fs.readFileSync("data/tweetables.json", "utf8"));
  json.gifNames.push(filename);
  const toWrite = JSON.stringify(json);
  console.log("adding --------->  " + filename);
  fs.writeFile("data/tweetables.json", toWrite, "utf8", fileWriteCallback);
}

function fileWriteCallback(err) {
  if (err) {
    console.log(err);
  } else {
    keepGenerating();
  }
}

keepGenerating();
