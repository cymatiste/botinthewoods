/*

     ,gggg,                                                    
   ,88"""Y8b,            ,dPYb,                                
  d8"     `Y8            IP'`Yb                                
 d8'   8b  d8            I8  8I                                
,8I    "Y88P'            I8  8'                                
I8'            ,ggggg,   I8 dP    ,ggggg,   ,gggggg,    ,g,    
d8            dP"  "Y8gggI8dP    dP"  "Y8gggdP""""8I   ,8'8,   
Y8,          i8'    ,8I  I8P    i8'    ,8I ,8'    8I  ,8'  Yb  
`Yba,,_____,,d8,   ,d8' ,d8b,_ ,d8,   ,d8',dP     Y8,,8'_   8) 
  `"Y8888888P"Y8888P"   8P'"Y88P"Y8888P"  8P      `Y8P' "YY8P8P

A helper utility!
- handles color conversion between hex, rgb and bgr
- also some basic color manipulation (e.g. blend between two colors, or adjust color brightness)
- provides a bunch of not yet terribly well organized functions for generating random colors under various constraints.
Sarah Imrisek 2017-2018
pretty ascii sig in 'nvscript' c/o http://www.kammerl.de/ascii/AsciiSignature.php

 */

function Colors(){

    var _hexChars =  ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

    var _this = this;

    this.testVar = "ohboy";

    this.variationsOn = function(color, variability){

        var col = color;

        if(!_this.isHex(color)){
            console.warn("this version of the code doesn't support web color names anymore.  Please hexify it for now; sorry!");
        } else {
            var rgbCol = _this.hexToRgb(col);
            var rand1 = Math.random();
            var rand2 = Math.random();
            var rand3 = Math.random();
            var newR = Math.max(0,Math.min(255,Math.round(rgbCol.r + rand1*variability - variability/2)));
            var newG = Math.max(0,Math.min(255,Math.round(rgbCol.g + rand2*variability - variability/2)));
            var newB = Math.max(0,Math.min(255,Math.round(rgbCol.b + rand3*variability - variability/2)));
            col = _this.rgbToHex({r:newR,g:newG,b:newB});
        }
        return col;
        
    };

    this.valueOfHexCol = function(hex){
        var rgbObj = _this.hexToRgb(hex);
        return (rgbObj.r + rgbObj.g + rgbObj.b)/3;
    }

    this.palette8bit = [0x000000,0x800000,0x008000,0x808000,0x000080,0x800080,0x008080,0xc0c0c0,0x808080,0xff0000,0x00ff00,0xffff00,0x0000ff,0xff00ff,0x00ffff,0xffffff,0x000000,0x00005f,0x000087,0x0000af,0x0000d7,0x0000ff,0x005f00,0x005f5f,0x005f87,0x005faf,0x005fd7,0x005fff,0x008700,0x00875f,0x008787,0x0087af,0x0087d7,0x0087ff,0x00af00,0x00af5f,0x00af87,0x00afaf,0x00afd7,0x00afff,0x00d700,0x00d75f,0x00d787,0x00d7af,0x00d7d7,0x00d7ff,0x00ff00,0x00ff5f,0x00ff87,0x00ffaf,0x00ffd7,0x00ffff,0x5f0000,0x5f005f,0x5f0087,0x5f00af,0x5f00d7,0x5f00ff,0x5f5f00,0x5f5f5f,0x5f5f87,0x5f5faf,0x5f5fd7,0x5f5fff,0x5f8700,0x5f875f,0x5f8787,0x5f87af,0x5f87d7,0x5f87ff,0x5faf00,0x5faf5f,0x5faf87,0x5fafaf,0x5fafd7,0x5fafff,0x5fd700,0x5fd75f,0x5fd787,0x5fd7af,0x5fd7d7,0x5fd7ff,0x5fff00,0x5fff5f,0x5fff87,0x5fffaf,0x5fffd7,0x5fffff,0x870000,0x87005f,0x870087,0x8700af,0x8700d7,0x8700ff,0x875f00,0x875f5f,0x875f87,0x875faf,0x875fd7,0x875fff,0x878700,0x87875f,0x878787,0x8787af,0x8787d7,0x8787ff,0x87af00,0x87af5f,0x87af87,0x87afaf,0x87afd7,0x87afff,0x87d700,0x87d75f,0x87d787,0x87d7af,0x87d7d7,0x87d7ff,0x87ff00,0x87ff5f,0x87ff87,0x87ffaf,0x87ffd7,0x87ffff,0xaf0000,0xaf005f,0xaf0087,0xaf00af,0xaf00d7,0xaf00ff,0xaf5f00,0xaf5f5f,0xaf5f87,0xaf5faf,0xaf5fd7,0xaf5fff,0xaf8700,0xaf875f,0xaf8787,0xaf87af,0xaf87d7,0xaf87ff,0xafaf00,0xafaf5f,0xafaf87,0xafafaf,0xafafd7,0xafafff,0xafd700,0xafd75f,0xafd787,0xafd7af,0xafd7d7,0xafd7ff,0xafff00,0xafff5f,0xafff87,0xafffaf,0xafffd7,0xafffff,0xd70000,0xd7005f,0xd70087,0xd700af,0xd700d7,0xd700ff,0xd75f00,0xd75f5f,0xd75f87,0xd75faf,0xd75fd7,0xd75fff,0xd78700,0xd7875f,0xd78787,0xd787af,0xd787d7,0xd787ff,0xd7af00,0xd7af5f,0xd7af87,0xd7afaf,0xd7afd7,0xd7afff,0xd7d700,0xd7d75f,0xd7d787,0xd7d7af,0xd7d7d7,0xd7d7ff,0xd7ff00,0xd7ff5f,0xd7ff87,0xd7ffaf,0xd7ffd7,0xd7ffff,0xff0000,0xff005f,0xff0087,0xff00af,0xff00d7,0xff00ff,0xff5f00,0xff5f5f,0xff5f87,0xff5faf,0xff5fd7,0xff5fff,0xff8700,0xff875f,0xff8787,0xff87af,0xff87d7,0xff87ff,0xffaf00,0xffaf5f,0xffaf87,0xffafaf,0xffafd7,0xffafff,0xffd700,0xffd75f,0xffd787,0xffd7af,0xffd7d7,0xffd7ff,0xffff00,0xffff5f,0xffff87,0xffffaf,0xffffd7,0xffffff,0x080808,0x121212,0x1c1c1c,0x262626,0x303030,0x3a3a3a,0x444444,0x4e4e4e,0x585858,0x626262,0x6c6c6c,0x767676,0x808080,0x8a8a8a,0x949494,0x9e9e9e,0xa8a8a8,0xb2b2b2,0xbcbcbc,0xc6c6c6,0xd0d0d0,0xdadada,0xe4e4e4,0xeeeeee];

    this.randomHex = function(){
        //console.log("randomHex:");
        var randomR = Math.floor(Math.random()*255);
        var randomG = Math.floor(Math.random()*255);
        var randomB = Math.floor(Math.random()*255);
        var rgbObj = {r:randomR, g:randomG, b:randomB};

        console.dir(rgbObj);
        return _this.rgbToHex(rgbObj);
    };

    this.randomBright = function(){
        var hexString = "#";
        var dropCol = Math.floor(Math.random()*3);

        for(var i=0; i<6; i++){
            if(((i==0 || i==1) && dropCol==0) || ((i==2 || i==3) && dropCol==1) || ((i==4 || i==5) && dropCol==2)){
                hexString = hexString + "0";
            } else {
                hexString = hexString + _hexChars[Math.floor(Math.random()*8)+8];    
            }
            
        }
        //console.log("dropCol: "+dropCol+", bright hex: "+hexString);
        return hexString;
    };


    this.randomBlack = function(){

        var lowR = Math.max(0, Math.min(255, Math.floor(Math.random()*15)));
        var lowG = Math.max(0, Math.min(255, Math.floor(Math.random()*15)));
        var lowB = Math.max(0, Math.min(255, Math.floor(Math.random()*15)));

        return _this.rgbToHex({r:lowR, g:lowG, b:lowB});
    };

    this.randomDarker = function(){
        var lowR = Math.floor(Math.random()*15);
        var lowG = Math.floor(Math.random()*15);
        var lowB = Math.floor(Math.random()*15);

        return _this.rgbToHex({r:lowR, g:lowG, b:lowB});
    };
        

    /**
     * Convert an object with r, g, and b values to a hex string
     * @param  {object} rgbObj  Object with values {r:redValue, g:greenValue, b:blueValue};
     * @return {string}         Hex colour string
     */
    this.rgbToHex = function(rgbObj) {
        return "#" + _componentToHex(rgbObj.r) + _componentToHex(rgbObj.g) + _componentToHex(rgbObj.b);
    };


    this.randomDarkGrey = function(){
        var INCR = 15;
        var base = INCR + Math.floor(Math.random()*INCR*4);
        var lowR = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR*2)-INCR)));
        var lowG = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR*2)-INCR)));
        var lowB = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR*2)-INCR)));

        return _this.rgbToHex({r:lowR, g:lowG, b:lowB});
    };

    this.randomGrey = function(){
        var INCR = 30;
        var base = Math.floor(Math.random()*INCR*2);
        var lowR = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR)-INCR/2)));
        var lowG = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR)-INCR/2)));
        var lowB = Math.max(0, Math.min(255, Math.floor(base + Math.floor(Math.random()*INCR)-INCR/2)));

        return _this.rgbToHex({r:lowR, g:lowG, b:lowB});
    };


    this.randomDark = function(){
        var lowR = Math.floor(Math.random()*45);
        var lowG = Math.floor(Math.random()*45);
        var lowB = Math.floor(Math.random()*45);

        return _this.rgbToHex({r:lowR, g:lowG, b:lowB});

    };


    /**
     * Take either a hex or rgba color and brighten it by a specified amount.
     * @param  {string} col         -- hex or rgba color to brighten
     * @param  {int} brightening    -- number of steps (out of 255) to increase brightness
     * @return {string}             -- modified color in same format as original
     */
    this.brightenByAmt = function(col,brightening){

        var rgbCol;

        if(_this.isHex(col)){
            rgbCol = _this.hexToRgb(col);
        } else if (col.r !== undefined && col.g !== undefined && col.b !== undefined){
            rgbCol = col;
        } else {
            console.warn("what kind of a color is "+col+" ?  Can't brighten.");
            return;
        }

         rgbCol.r = Math.max(0,Math.min(255, Math.floor(rgbCol.r + brightening)));
         rgbCol.g = Math.max(0,Math.min(255, Math.floor(rgbCol.g + brightening)));
         rgbCol.b = Math.max(0,Math.min(255, Math.floor(rgbCol.b + brightening)));

         if(_this.isHex(col)){
            return _this.rgbToHex(rgbCol);
         } else {
            return rgbCol;
         }
    };

    this.intToHex = function(int){
        return parseInt(int.toString(16), 16);
    };

    this.parseHex = function(hexString){
        if((typeof(hexString)=='number')){
            return hexString;
        } else {
            return parseInt(hexString.replace(/#/g,"0x"));
        } 
    };

    _this.hexToInt = function(hex){
        var int = 0;
        for(var i=1; i<hex.length; i++){
            var char = hex.charAt(i);
            for(var c=0; c<_hexChars.length; c++){
                if(char == _hexChars[c]){
                    int += c*Math.pow(16,(5-(i-1)));
                }
            }
        }
        return int;
    };

    this.hexToBgrInt = function(hex){
        return _this.hexToInt(_this.rgbToBgrHex(_this.hexToRgb(hex)));
    };

    /**
     * Is the provided string a valid hex value?
     * @param  {string} colourStr
     * @return {bool}               true iff colourStr represents a hex value.
     */
    this.isHex = function(colourStr) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colourStr);
    };

    /**
     * Convert a web colour name to a hex string
     * 
     * ONLY WORKS IN BROWSER!!
     * 
     * @param  {string} colourStr    a CSS colour name
     * @return {string}
     */
    this.webColourToHex = function(colourStr) {
        var a = document.createElement("div");
        a.style.color = colourStr;
        var colours = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a) {
            return parseInt(a, 10);
        });
        document.body.removeChild(a);
        var workingHex = (colours.length >= 3) ? "#" + (((1 << 24) + (colours[0] << 16) + (colours[1] << 8) + colours[2]).toString(16).substr(1)) : false;
        if (workingHex) {
            return workingHex;
        } else {
            throw (colourStr + " does not represent a known web colour.");
        }
    };

    /**
     * Get the hex value of a string that may be a named web colour, or may already be in hex
     * @param  {string} colourStr    The string representing a colour
     * @return {string}             Hex string representing the colour
     */
    this.nameToHex = function(colourStr) {
        if (_this.isHex(colourStr)) {
            return colourStr;
        } else {
           console.warn("what type of entity is this? "+colourStr);
        }
    };

    this.complimentaryRGB = function(rgbObj){
        return {r: 255-rgbObj.r, g:255-rgbObj.g, b:255-rgbObj.b};
    };

    this.complimentaryHex = function(hexString){
        return _this.rgbToHex(_this.complimentaryRGB(_this.hexToRgb(hexString)));
    };

    /**
     * Get a weighted average of two colours
     * 
     * REMOVED SUPPORT FOR WEB COLOUR NAMES, need to put this back within node.
     * 
     * @param  {string} colourStr1       A web colour name 
     * @param  {string} colourStr2       A web colour name 
     * @param  {Number} proportion1     Proportion (0<p<1) of colour1 to use in the mix
     * @param  {Number} proportion2     Proportion (0<p<1) of colour1 to use in the mix
     * @return {string}                 Hex string representing the mixed colour
     */
    this.mixHexCols = function(colourStr1, colourStr2, proportion1, proportion2) {

        //console.log(" m i x i n g  "+colourStr1+" & "+colourStr2+", "+proportion1+" / "+proportion2);

        var rgb1 = _this.hexToRgb(colourStr1);
        var rgb2 = _this.hexToRgb(colourStr2);

        var rgbmixed = {
            r : Math.floor(rgb1.r * proportion1 + rgb2.r * proportion2),
            g : Math.floor(rgb1.g * proportion1 + rgb2.g * proportion2),
            b : Math.floor(rgb1.b * proportion1 + rgb2.b * proportion2)
        };

        return _this.rgbToHex(rgbmixed);
    };

    /**
     * Convert a hex string to an object with r, g, and b values.
     * // with thanks to http://stackoverflow.com/users/1047797/david
     * @param  {string} hex     Hex colour string
     * @return {object}         Object of type {r:redValue, g:greenValue, b:blueValue};
     */
    this.hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        //console.log("hexToRgb "+hex);
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var hexBreakdown = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        var rgbObj = hexBreakdown ? {
            r : parseInt(hexBreakdown[1], 16),
            g : parseInt(hexBreakdown[2], 16),
            b : parseInt(hexBreakdown[3], 16)
        } : null;

        if(rgbObj == null){
            console.warn("tried to rgbify hex "+hex+" but it broke.");
        }

        return rgbObj;
    };

    /**
     * Convert an object with r, g, and b values to a hex string
     * @param  {object} rgbObj  Object with values {r:redValue, g:greenValue, b:blueValue};
     * @return {string}         Hex colour string
     */
    this.rgbToHex = function(rgbObj) {
        return "#" + _componentToHex(rgbObj.r) + _componentToHex(rgbObj.g) + _componentToHex(rgbObj.b);
    };

    this.rgbToBgrHex = function(rgbObj) {
        return "#" + _componentToHex(rgbObj.b) + _componentToHex(rgbObj.g) + _componentToHex(rgbObj.r);
    };


    /**
     * Helper for rgbToHex, converts each individual colour component to a single hex value
     * @param  {Number} c  A number between 0 and 255
     * @return {string}    The hex equivalent of the provided component
     */
    function _componentToHex (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}

module.exports = Colors;