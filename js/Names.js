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
        var word1 = _json.corpus.shift();
        var word2 = _json.corpus.shift();
        var word3 = _json.corpus.shift();
        _json.used.push(word1,word2,word3);
        nameString = word1+word2+word3;
        
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
