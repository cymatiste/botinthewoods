var Twit = require('twit');
var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js'));
var T = new Twit(config);
T.post('statuses/update', { status: 'yeah boi.'}, function (err, data, response){console.log(data);});