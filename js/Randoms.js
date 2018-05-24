 function Randoms() {
    //### Make random more readable #########################################3

    var _this = this;
    /** 
     * with one parameter: return an integer between 0 and a (excluding a)
     * with two parameters: Return an integer between a and b (excluding b)
     */
    this.randomInt = function(a, b){
        return Math.floor(_this.random(a, b));
    }

    /** 
     * with one parameter: return a decimal number between 0 and a
     * with two parameters: return a decimal number between a and b
     */
    this.random = function(a, b){
        var bottom, top;
        if(b == null){
            bottom = 0;
            top = a; 
        } else {
            bottom = a;
            top = b;
        }
        return bottom + Math.random()*(top - bottom);
    }

    /**
     * Return a random element in the array
     */
    this.randomFrom = function(array){
        return array[Math.floor(Math.random()*array.length)];
    }

    /**
     * Return the number randomly positive or negative
     */
    this.randomSign = function(num) {
        return num*((Math.random() > 0.5) ? 1 : -1);
    }
}

module.exports = Randoms;
