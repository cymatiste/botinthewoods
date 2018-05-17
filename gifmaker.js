var fs = require('fs'),
    path = require('path'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'));

function _keepGenerating(){

    var gen = new ForestGenerator();

    // Make the GIF
    var filename = 'forest'+Math.floor(Math.random()*999999);
    _recordAsTweetable(gen.generateSceneGIF(100, filename));

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