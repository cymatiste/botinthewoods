var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js')),
    config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

var _lastTimeStamp;
var _firstRun = true;
var _GIFnames = [];
var _tweetInterval;

// Run this if we want to detect when people tweet us
//var stream = T.stream('statuses/filter', { track: ['@rttreebot'] });

// soon
//stream.on('tweet', tweetEvent);

/**
 * Do it.
 * @return {void}
 */
function tweetAForest(){

    _lastTimeStamp = Date.now();
    
    if(_GIFnames.length == 0){
        console.log("...no GIFs yet, try again...");
        keepGenerating();
    }

    var gifName = _GIFnames.shift();
    var filePath = path.join(__dirname,'/images/',gifName+'.gif');

    // Upload the GIF
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        if (err) {
            console.log(err);
            tweetAForest();
        } else {
            console.log(data);
            const params = {
              status: "",
              media_ids: [data.media_id_string],
              encoding: 'base64'
            }

            // Tweet the GIF
            T.post('statuses/update', params, function(err, data, response) {
              if (err !== undefined) {
                console.log(err);
                tweetAForest();
              } else {
                console.log('Tweeted: ' + params.status);
                keepGenerating();
              }
            });
            //console.log('Tweeted: ' + params.status);
            //keepGenerating();            
        }
    });
    
}

function tweetEvent(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;

    var displayName = tweet.user.name;
    // What is the text?
    // var txt = tweet.text;
    // the status update or tweet ID in which we will reply
    var nameID  = tweet.id_str;

    // What was the tweet replying to?
    var parentId =  tweet.in_reply_to_status_id_str;

    if(parentId == null){
        // Start a reply back to the sender
        var reply = "@" + name + " Hi! Please @ me in reply to another tweet if you want me to try to generate a tree from that tweet. Otherwise I've got nothing to work with.";
        var params             = {
                                  status: reply,
                                  in_reply_to_status_id: nameID
                                 };

        T.post('statuses/update', params, function(err, data, response) {
          if (err !== undefined) {
            console.log(err);
          } else {
            console.log('Tweeted: ' + params.status);
          }
        });
        console.log('Tweeted: ' + params.status);
      
    }
    
   
    //T.get('statuses/show/:id', {id: parentId}, function(err, data, response) {
    
    var requestParams = {id: parentId, count: 100, trim_user: false};    

    T.get('statuses/retweets/:id', requestParams, function(err, data, response) {
          if (err !== undefined) {
            console.log(err);
            
          } else {

            for(var i=0; i<data.length; i++){
                console.dir(data[i].retweeted_status);
                //console.dir(data[i].user.contributors);
                //console.dir(data[i].retweeted_status.extended_entities);
            }
 
        
        }
    });
};


function keepGenerating(){

    var gen = new ForestGenerator();

    // Make the GIF
    var filename = 'forest'+Math.floor(Math.random()*999999);
    _GIFnames.push(gen.generateSceneGIF(100, filename));

    logTimeElapsed();
    var minsElapsed = ((Date.now() - _lastTimeStamp)/60000);
    if( _firstRun || minsElapsed > _tweetInterval){
        _firstRun = false;
        console.log("tryna tweet now.");
        tweetAForest();
    } else {
        console.log("..."+minsElapsed+" < "+_tweetInterval+", waiting...");
        keepGenerating();
    }
}

function logTimeElapsed(){
    var nowTime = Date.now();
    var timeElapsed = Math.floor((nowTime - _lastTimeStamp)/60000);
    console.log(" --- "+timeElapsed+" minutes ---");
}


function tweetEveryThisManyMinutes(mins){
    _lastTimeStamp = Date.now();
    _tweetInterval = mins;
    keepGenerating();    
}

tweetEveryThisManyMinutes(45);
