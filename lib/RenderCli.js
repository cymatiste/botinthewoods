"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const imagemin = require("imagemin");
const imageminGiflossy = require("imagemin-giflossy");
const Names_1 = require("./Names");
const Randoms_1 = require("./Randoms");
const Colors_1 = require("./Colors");
const ForestGenerator_1 = require("./ForestGenerator");
let filename;
const r = new Randoms_1.default();
const c = new Colors_1.default();
const namer = new Names_1.default();
function keepGenerating() {
    // Make the GIF
    //filename = 'forest'+Math.floor(Math.random()*999999);
    filename = namer.getName();
    //console.log("got filename "+filename);
    setTimeout(function () {
        makeForest(filename);
    }, 2000);
}
function makeForest(filename) {
    console.log("generating " + filename);
    const rainbowTrees = Math.random() < 0.02;
    const numTrees = rainbowTrees ? r.randomInt(20, 40) : r.randomInt(30, 90);
    const forestOptions = {
        RAINBOW: false,
        TREE_TYPE: "deciduous",
        //TREE_TYPE: r.randomFrom(["deciduous","deciduous","coniferous"]),
        NUM_TREES: numTrees,
        //NUM_TREES: 5,
        //NIGHT_MODE: true,
        MIRROR: false,
        GRASS_DENSITY: r.randomFrom([
            0,
            0,
            0,
            r.randomInt(10, 50),
            r.randomInt(50, 80),
            r.randomInt(80, 130),
            r.randomInt(130, 250)
        ])
        //numTrees > 45 ? 0 : r.randomFrom([0, 0, 0, 0, 0, 25, 50, 75, 100])
    };
    const branchMaxRad = r.random(0.6, 2.4);
    const maxDepth = r.randomInt(4, 20);
    const treeOptions = {
        BRANCH_R_MAX: branchMaxRad,
        BRANCH_R_MIN: 0.06,
        BRANCH_L: r.random(4, 15),
        //BRANCH_L: r.random(5,10),
        //BRANCH_L: Math.max(maxRad*10,r.random(4, 10)),
        BRANCH_P: r.random(0.65, 0.85),
        CHANCE_DECAY: r.random(0.003, 0.025),
        //CHANCE_DECAY: pickDecay(),
        LENGTH_MULT: r.random(0.88, 0.98),
        ANGLE_MIN: r.random(15, 60),
        ANGLE_MAX: r.random(90, 120),
        RAINBOW: rainbowTrees,
        // COLOR_TOP: c.randomHex(),
        //COLOR_BTM: c.brightenByAmt(c.randomHex(),-100),
        //LEAF_COLS: ["#FFCC00","#EEEE44","#FF0055","#EE9922","#EE0505","#DD4400","#FF9977","#BEB344"],
        //LEAF_COLS: ["#2A141D","#1B0005","#2A2B05","#161102","#231313","#0F0F1B","#181D11","#4E430F"],
        //LEAF_SIZE: branchMaxRad*0.75,
        //LEAF_DENSITY: r.randomInt(15,35),
        // LEAF_W: r.random(0.7,1),
        //MAX_DEPTH: maxDepth,
        // MAX_BRANCHES_TOTAL: 999,
        MAX_BRANCHES_PER_NODE: Math.random() < 0.2 ? 3 : 2,
        MUSHROOMS: Math.random() < 0.3
    };
    const gen = new ForestGenerator_1.default(forestOptions, treeOptions);
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
    }
    else {
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
    }
    else {
        keepGenerating();
    }
}
keepGenerating();
