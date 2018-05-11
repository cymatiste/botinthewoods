var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    ForestGenerator = require('./js/ForestGenerator.js'),
    config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);


//var stream = T.stream('statuses/filter', { track: ['@rttreebot'] });

// soon
//stream.on('tweet', tweetEvent);


function tweetAForest(){
    var treegen = new ForestGenerator();

    var filename = 'tree'+Math.floor(Math.random()*999999);
    treegen.generateSceneGIF(100, filename);

    var filePath = './images/'+filename+'.gif';
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        if (err) {
            console.log(err)
        } else {
            console.log(data);
            const params = {
              status: "",
              media_ids: data.media_id_string
            }

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

    //T.post('statuses/update', { status: 'hmm'}, function (err, data, response){console.log(data);});
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


//tweetAForest();


function tweetEveryThisManyMinutes(mins){
    setInterval(tweetAForest, mins*60*1000);
}

tweetEveryThisManyMinutes(15);
tweetAForest();
