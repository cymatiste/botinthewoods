var fs = require('fs'),
    path = require('path'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'));


function _newForest(numFrames){

    var gen = new ForestGenerator();

    // Make the GIF
    var filename = 'test'+Math.floor(Math.random()*999999);
    console.log("plz generate "+filename);
    return(gen.generateSceneGIF(numFrames, filename));

}

function _keepGenerating(numFrames){

    console.log("^_^ "+_newForest(numFrames));
    
    _keepGenerating();
}



//_keepGenerating(100);
_newForest(100);
