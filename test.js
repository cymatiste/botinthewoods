var fs = require('fs'),
    path = require('path'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'));


function _newForest(numFrames){

    var gen = new ForestGenerator();

    var numTrees = 5;
    // Make the GIF
    var filename = 'test'+Math.floor(Math.random()*999999);
    console.log("plz generate "+filename);
    return(gen.generateSceneGIF(numFrames, filename, numTrees));

}

_newForest(1);

