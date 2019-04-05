const fs = require('fs'),
    path = require('path'),
    Names = require(path.join(__dirname, 'js/Names.js')),
    Randoms = require(path.join(__dirname, 'js/Randoms.js')),
    Colors = require(path.join(__dirname, 'js/Colors.js')),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js')),
    imagemin = require('imagemin'),
    imageminGiflossy = require('imagemin-giflossy');

var _namer = new Names();
var _filename;
var _r = new Randoms();
var _c = new Colors();

function _keepGenerating(){
    // Make the GIF
    //_filename = 'forest'+Math.floor(Math.random()*999999);
    _filename = _namer.getName();
    //console.log("got filename "+_filename);
    setTimeout(function(){_makeForest(_filename);},2000);
}

function _makeForest(filename){
    console.log("generating "+filename);

    var numTrees = _r.randomInt(30, 70);
    var forestOptions = {
        RAINBOW: false,
        TREE_TYPE: "deciduous",
        //TREE_TYPE: _r.randomFrom(["deciduous","deciduous","coniferous"]),
        NUM_TREES: numTrees,
        //NUM_TREES: 5,
        GRASS_DENSITY: (numTrees > 45) ? 0 : _r.randomFrom([0,0,0,0,0,25,50,75,100]),
        //GRASS_DENSITY: 0 //_r.randomFrom([0,0,0,50])
    }

    var branchMaxRad = _r.random(0.6,1.8);
    var maxDepth = _r.randomInt(8,13);
    var treeOptions = {
        BRANCH_R_MAX: branchMaxRad,
        BRANCH_R_MIN: 0.06,
        BRANCH_L: _r.random(5,15),
        //BRANCH_L: _r.random(5,10),
        //BRANCH_L: Math.max(maxRad*10,_r.random(4, 10)),  
        BRANCH_P: _r.random(0.72, 0.77),
        CHANCE_DECAY: _r.random(0.01,0.05),
        //CHANCE_DECAY: _pickDecay(),
        LENGTH_MULT: _r.random(0.8, 0.95),
        ANGLE_MIN: _r.random(15, 30), 
        ANGLE_MAX: _r.random(60, 90), 
        RAINBOW: false,
       // COLOR_TOP: _c.randomHex(), 
        //COLOR_BTM: _c.brightenByAmt(_c.randomHex(),-100), 
        //LEAF_COLS: ["#FFCC00","#EEEE44","#FF0055","#EE9922","#EE0505","#DD4400","#FF9977","#BEB344"], 
        //LEAF_COLS: ["#2A141D","#1B0005","#2A2B05","#161102","#231313","#0F0F1B","#181D11","#4E430F"], 
        //LEAF_SIZE: branchMaxRad*0.75,
        //LEAF_DENSITY: _r.randomInt(15,35),
        // LEAF_W: _r.random(0.7,1),
        MAX_DEPTH: maxDepth, 
        // MAX_BRANCHES_TOTAL: 999, 
        MAX_BRANCHES_PER_NODE: 3
    };

    var gen = new ForestGenerator(forestOptions,treeOptions);
    //_optimize(gen.generateSceneGIF(100, filename),256);
    _recordAsTweetable(gen.generateSceneGIF(100, filename),256);
}

function _optimize(filename,paletteSize) {
    _filename = filename;
    const sizeLimit = 1048576*5;
    var fileSizeInBytes = fs.statSync(filename).size;
    var nextStepDown = Math.floor(paletteSize*0.9);
    if(fileSizeInBytes > sizeLimit){
        imagemin(['images/'+_filename+'.gif'], 'images', {use: [imageminGiflossy({lossy: nextStepDown})]}).then(() => {
            _optimize(_filename,nextStepDown);
        });

    } else {
        _recordAsTweetable(_filename);
    }
    
    return filename;
}

function _recordAsTweetable(filename){
    var json = JSON.parse(fs.readFileSync('tweetables.json', 'utf8'));
    json.gifNames.push(filename);
    var toWrite = JSON.stringify(json);
    console.log("adding --------->  "+filename);
    fs.writeFile('tweetables.json', toWrite, 'utf8', _fileWriteCallback);
}

function _fileWriteCallback(err, data){
    if (err){
        console.log(err);
    } else {
        _keepGenerating();
    }
}

_keepGenerating();