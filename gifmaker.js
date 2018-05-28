var fs = require('fs'),
    path = require('path'),
    Names = require(path.join(__dirname, 'js/Names.js'));
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'));

var _namer = new Names();
var _filename;

function _keepGenerating(){
    // Make the GIF
    //var filename = 'forest'+Math.floor(Math.random()*999999);
    _filename = _namer.getName();
    console.log("got filename "+_filename);
    setTimeout(function(){_makeForest(_filename);},2000);
}

function _makeForest(filename){
    console.log("generating "+filename);
    var gen = new ForestGenerator();
    _recordAsTweetable(gen.generateSceneGIF(100, filename, 125));
}

function _recordAsTweetable(filename){
    var json = JSON.parse(fs.readFileSync('tweetables.json', 'utf8'));
    json.gifNames.push(filename);
    var toWrite = JSON.stringify(json);
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