var Twit = require('twit');
var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    TreeGenerator = require('./js/TreeGenerator.js'),
    config = require(path.join(__dirname, 'config.js'));

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