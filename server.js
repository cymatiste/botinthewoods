var Twit = require('twit');
var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js'));
    var TreeGenerator = require('./js/TreeGenerator.js');
var T = new Twit(config);
//T.post('statuses/update', { status: 'yeah boi.'}, function (err, data, response){console.log(data);});

var stream = T.stream('statuses/filter', { track: ['@rttreebot'] });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;

    var displayName = tweet.user.name;
    // What is the text?
    // var txt = tweet.text;
    // the status update or tweet ID in which we will reply
    var nameID  = tweet.id_str;

    var treegen = new TreeGenerator();
    treegen.makeNewTree();

    // What was the tweet replying to?
    var parentId =  tweet.in_reply_to_status_id_str;

    if(parentId !== undefined){
        console.log("looking up tweet "+parentId);
        //T.get('statuses/show/:id', {id: parentId}, function(err, data, response) {
        

        /*
        T.get('statuses/retweets/:id', {id: parentId}, function(err, data, response) {
          if (err !== undefined) {
            console.log(err);
            
          } else {

            console.dir(data);
            // Start a reply back to the sender
            var reply = "@" + name + " ? / "+rtcount+" / "+favcount;
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
      });
      */

  } else {
      console.log("could not get parentId.");
    }
         // Get rid of the @ mention
    // var txt = txt.replace(/@myTwitterHandle/g, "");

    
};