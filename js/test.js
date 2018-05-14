
var fs = require('fs'),
path = require('path');
TreeGenerator = require('./ForestGenerator.js');

var treegen = new TreeGenerator();
var filename = 'tree'+Math.floor(Math.random()*999999);
treegen.generateSceneGIF(50,filename);