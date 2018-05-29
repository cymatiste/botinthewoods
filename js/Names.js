function Names() {

    var fs = require('fs'),
    path = require('path');

    var _json =  JSON.parse(fs.readFileSync('corpus.json', 'utf8'));
    
    this.getName = function(){
        var nameString = "";
        if(_json.corpus.length == 0){
            _json.corpus = _json.used;
            _json.used = [];
        }
        var word = _json.corpus.shift();
        _json.used.push(word);
        nameString = "forest-of-" + word;
        
        var toWrite = JSON.stringify(_json);
        fs.writeFile('corpus.json', toWrite, 'utf8', function(err, data){
            if (err){
                console.log(err);
            } else {
                console.log("corpus updated.");
            }      
        });
        return nameString;
    }
}

module.exports = Names;
