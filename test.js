var fs = require('fs'),
    path = require('path'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'));


function _newForest(){

    var gen = new ForestGenerator();

    // Make the GIF
    var filename = 'test'+Math.floor(Math.random()*999999);
    console.log("plz generate "+filename);
    return(gen.generateSceneGIF(100, filename));

}

function _keepGenerating(){

    var gen = new ForestGenerator();
    console.log("^_^ "+_newForest());
    
    _keepGenerating();
}



_keepGenerating();
//tweetAForest();
