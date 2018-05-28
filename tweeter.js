var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

var _firstRun = true;
var _threading = false;

var _json, _status;

/**
 * Do it.
 * @return {void}
 */
function _tweetAForest(){

    _json = JSON.parse(fs.readFileSync('tweetables.json', 'utf8'));
    
    if(_json.gifNames.length == 0){
        console.log("...no GIFs yet, try again...");
        return;
    }

    var gifName = _json.gifNames.shift();
    var filePath = path.join(__dirname,'/images/',gifName+'.gif');
    
    if(_json.quotes.length > 0){
        _status = _json.quotes.shift();
    } else {
        _status = "";
        _json.replyTo = "";
    }
   

    // Upload the GIF
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);

            var replyId = _json.replyTo;
            var params;

            if(_threading && replyId !== null && replyId.length > 0){
		    	_status = "@botinthewoods \n"+_status;
		    	params = {
		            status: _status,
		            media_ids: [data.media_id_string],
		            encoding: 'base64',
		            in_reply_to_status_id: replyId
		        };
		    } else {
		    	params = {
		            status: _status,
		            media_ids: [data.media_id_string],
		            encoding: 'base64'
		        };
		    }

            // Tweet the GIF
            T.post('statuses/update', params, function(err, data, response) {
                if (err !== undefined) {
                    console.log(err);

                } else {
                    console.log('Tweeted: ' + params.status+", "+data);
                    if(_threading && _json.quotes.length > 0){
                		_json.replyTo = data.id_str;
                	} else {
                		_json.replyTo = "";
                	}

                    var toWrite = JSON.stringify(_json);
                    fs.writeFile('tweetables.json', toWrite, 'utf8', function(err, data){
                        if (err){
                            console.log(err);
                        } else {
                            console.log("tweetables updated.");
                        }      
                    });
                }
            });
        }
    });
}

function _tweetEveryThisManyMinutes(mins){
    setInterval(_tweetAForest, mins*60*1000);   
    if(_firstRun){
        _tweetAForest();
    } 
}

_tweetEveryThisManyMinutes(120);
