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

export default class Colors {
  hexChars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f"
  ];

  variationsOn(color: string, variability) {
    let col = color;
    //console.log("color: "+col+", variability: "+variability);
    if (!this.isHex(col)) {
      throw new Error(
        ": this version of the code doesn't support web color names anymore.  Please hexify it for now; sorry!"
      );
    } else {
      const rgbCol = this.hexToRgb(col);
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const newR = Math.max(
        0,
        Math.min(
          255,
          Math.round(rgbCol.r + rand1 * variability - variability / 2)
        )
      );
      const newG = Math.max(
        0,
        Math.min(
          255,
          Math.round(rgbCol.g + rand2 * variability - variability / 2)
        )
      );
      const newB = Math.max(
        0,
        Math.min(
          255,
          Math.round(rgbCol.b + rand3 * variability - variability / 2)
        )
      );
      col = this.rgbToHex({ r: newR, g: newG, b: newB });
    }
    return col;
  }

  valueOfHexCol(hex) {
    const rgbObj = this.hexToRgb(hex);
    return (rgbObj.r + rgbObj.g + rgbObj.b) / 3;
  }

  randomPastel() {
    const randomR = Math.floor(190 + Math.random() * 65);
    const randomG = Math.floor(190 + Math.random() * 65);
    const randomB = Math.floor(190 + Math.random() * 65);
    const rgbObj = { r: randomR, g: randomG, b: randomB };

    //console.dir(rgbObj);
    return this.rgbToHex(rgbObj);
  }

  randomBlue() {
    const randomR = Math.floor(0 + Math.random() * 150);
    const randomG = Math.floor(0 + Math.random() * 150);
    const randomB = Math.floor(0 + Math.random() * 255);
    const rgbObj = { r: randomR, g: randomG, b: randomB };

    //console.dir(rgbObj);
    return this.rgbToHex(rgbObj);
  }

  almostBW() {
    return Math.random() < 0.1
      ? this.randomHex(true)
      : Math.random() < 0.5
      ? this.randomPastel()
      : this.randomDarkGrey();
  }

  almostBlue() {
    return Math.random() < 0.1 ? this.randomHex(true) : this.randomBlue();
  }

  randomHex(override?) {
    // greyout
    //return this.variationsOn("#999999",25);

    if (!override) {
      //return this.almostBW();
    }

    const randomR = Math.floor(Math.random() * 255);
    const randomG = Math.floor(Math.random() * 255);
    const randomB = Math.floor(Math.random() * 255);
    const rgbObj = { r: randomR, g: randomG, b: randomB };

    //console.dir(rgbObj);
    return this.rgbToHex(rgbObj);
  }

  /**
   * Return a hex string representing a grey with value provided in the RGB range
   * -------------------------------------------------------------------------------
   * @param  {val255}
   * @return {string}
   */
  greyHex(val255) {
    return this.rgbToHex({ r: val255, g: val255, b: val255 });
  }

  randomBright() {
    let hexString = "#";
    const dropCol = Math.floor(Math.random() * 3);

    for (let i = 0; i < 6; i++) {
      if (
        ((i === 0 || i === 1) && dropCol === 0) ||
        ((i === 2 || i === 3) && dropCol === 1) ||
        ((i === 4 || i === 5) && dropCol === 2)
      ) {
        hexString = hexString + "0";
      } else {
        hexString =
          hexString + this.hexChars[Math.floor(Math.random() * 8) + 8];
      }
    }
    //console.log("dropCol: "+dropCol+", bright hex: "+hexString);
    return hexString;
  }

  randomBlack() {
    const lowR = Math.max(0, Math.min(255, Math.floor(Math.random() * 15)));
    const lowG = Math.max(0, Math.min(255, Math.floor(Math.random() * 15)));
    const lowB = Math.max(0, Math.min(255, Math.floor(Math.random() * 15)));

    return this.rgbToHex({ r: lowR, g: lowG, b: lowB });
  }

  randomDarker() {
    const lowR = Math.floor(Math.random() * 15);
    const lowG = Math.floor(Math.random() * 15);
    const lowB = Math.floor(Math.random() * 15);

    return this.rgbToHex({ r: lowR, g: lowG, b: lowB });
  }

  randomDarkGrey() {
    const INCR = 15;
    const base = INCR + Math.floor(Math.random() * INCR * 4);
    const lowR = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR * 2) - INCR)
      )
    );
    const lowG = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR * 2) - INCR)
      )
    );
    const lowB = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR * 2) - INCR)
      )
    );

    return this.rgbToHex({ r: lowR, g: lowG, b: lowB });
  }

  randomGrey() {
    const INCR = 80;
    const base = Math.floor(Math.random() * INCR * 2);
    const lowR = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR) - INCR / 2)
      )
    );
    const lowG = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR) - INCR / 2)
      )
    );
    const lowB = Math.max(
      0,
      Math.min(
        255,
        Math.floor(base + Math.floor(Math.random() * INCR) - INCR / 2)
      )
    );

    return this.rgbToHex({ r: lowR, g: lowG, b: lowB });
  }

  randomDark() {
    const lowR = Math.floor(Math.random() * 45);
    const lowG = Math.floor(Math.random() * 45);
    const lowB = Math.floor(Math.random() * 45);

    return this.rgbToHex({ r: lowR, g: lowG, b: lowB });
  }

  /**
   * Take either a hex or rgba color and brighten it by a specified amount.
   * @param  {string} col         -- hex or rgba color to brighten
   * @param  {int} brightening    -- number of steps (out of 255) to increase brightness
   * @return {string}             -- modified color in same format as original
   */
  brightenByMult(col, brightening) {
    let rgbCol;

    if (this.isHex(col)) {
      rgbCol = this.hexToRgb(col);
    } else if (
      col.r !== undefined &&
      col.g !== undefined &&
      col.b !== undefined
    ) {
      rgbCol = col;
    } else {
      console.warn("what kind of a color is " + col + " ?  Can't brighten.");
      return;
    }

    rgbCol.r = Math.max(0, Math.min(255, Math.floor(rgbCol.r * brightening)));
    rgbCol.g = Math.max(0, Math.min(255, Math.floor(rgbCol.g * brightening)));
    rgbCol.b = Math.max(0, Math.min(255, Math.floor(rgbCol.b * brightening)));

    if (this.isHex(col)) {
      return this.rgbToHex(rgbCol);
    } else {
      console.log("brightenByAmt returning in rgb format");
      return rgbCol;
    }
  }

  /**
   * Take either a hex or rgba color and brighten it by a specified amount.
   * @param  {string} col         -- hex or rgba color to brighten
   * @param  {int} brightening    -- number of steps (out of 255) to increase brightness
   * @return {string}             -- modified color in same format as original
   */
  brightenByAmt(col, brightening) {
    let rgbCol;

    if (this.isHex(col)) {
      rgbCol = this.hexToRgb(col);
    } else if (
      col.r !== undefined &&
      col.g !== undefined &&
      col.b !== undefined
    ) {
      rgbCol = col;
    } else {
      console.warn("what kind of a color is " + col + " ?  Can't brighten.");
      return;
    }

    rgbCol.r = Math.max(0, Math.min(255, Math.floor(rgbCol.r + brightening)));
    rgbCol.g = Math.max(0, Math.min(255, Math.floor(rgbCol.g + brightening)));
    rgbCol.b = Math.max(0, Math.min(255, Math.floor(rgbCol.b + brightening)));

    if (this.isHex(col)) {
      return this.rgbToHex(rgbCol);
    } else {
      console.log("brightenByAmt returning in rgb format");
      return rgbCol;
    }
  }

  // B U G G Y / u n r e l i a b l e / look deeper
  intToHex(int) {
    return "#" + int.toString(16); //.slice(0,6);
  }

  parseHex(hexString) {
    if (typeof hexString === "number") {
      return hexString;
    } else {
      return parseInt(hexString.replace(/#/g, "0x"));
    }
  }

  hexToInt(hex: string) {
    let int = 0;
    for (let i = 1; i < hex.length; i++) {
      const char = hex.charAt(i);
      for (let c = 0; c < this.hexChars.length; c++) {
        if (char === this.hexChars[c]) {
          int += c * Math.pow(16, 5 - (i - 1));
        }
      }
    }
    return int;
  }

  hexToBgrInt(hex) {
    return this.hexToInt(this.rgbToBgrHex(this.hexToRgb(hex)));
  }

  /**
   * Is the provided string a valid hex value?
   * @param  {string} colourStr
   * @return {bool}               true iff colourStr represents a hex value.
   */
  isHex(colourStr) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colourStr);
  }

  /**
   * Convert a web colour name to a hex string
   *
   * ONLY WORKS IN BROWSER!!
   *
   * @param  {string} colourStr    a CSS colour name
   * @return {string}
   */
  // TODO This doesn't seem to be used anywhere and...
  // webColourToHex(colourStr) {
  //   const a = document.createElement("div");
  //   a.style.color = colourStr;
  //   const colours = window
  //     .getComputedStyle(document.body.appendChild(a))
  //     .color.match(/\d+/g) // TODO there's something funky about this
  //     .map(function(a) {
  //       return parseInt(a, 10);
  //     });
  //   document.body.removeChild(a);
  //   const workingHex =
  //     colours.length >= 3
  //       ? "#" +
  //         ((1 << 24) + (colours[0] << 16) + (colours[1] << 8) + colours[2])
  //           .toString(16)
  //           .substr(1)
  //       : false;
  //   if (workingHex) {
  //     return workingHex;
  //   } else {
  //     throw colourStr + " does not represent a known web colour.";
  //   }
  // }

  /**
   * Get the hex value of a string that may be a named web colour, or may already be in hex
   * @param  {string} colourStr    The string representing a colour
   * @return {string}             Hex string representing the colour
   */
  nameToHex(colourStr) {
    if (this.isHex(colourStr)) {
      return colourStr;
    } else {
      console.warn("what type of entity is this? " + colourStr);
    }
  }

  complimentaryRGB(rgbObj) {
    return { r: 255 - rgbObj.r, g: 255 - rgbObj.g, b: 255 - rgbObj.b };
  }

  complimentaryHex(hexString) {
    return this.rgbToHex(this.complimentaryRGB(this.hexToRgb(hexString)));
  }

  /**
   * Get a weighted average of two colours
   *
   * REMOVED SUPPORT FOR WEB COLOUR NAMES, need to put this back within node.
   *
   * @param  {string} colourStr1       A web colour name
   * @param  {string} colourStr2       A web colour name
   * @param  {Number} proportion1     Proportion (0<=p<=1) of colour1 to use in the mix
   * @param  {Number} proportion2     Proportion (0<=p<=1) of colour2 to use in the mix
   * @return {string}                 Hex string representing the mixed colour
   */
  mixHexCols(colourStr1, colourStr2, proportion1, proportion2) {
    //console.log(" m i x i n g  "+colourStr1+" & "+colourStr2+", "+proportion1+" / "+proportion2);

    const rgb1 = this.hexToRgb(colourStr1);
    const rgb2 = this.hexToRgb(colourStr2);

    const rgbmixed = {
      r: Math.floor(rgb1.r * proportion1 + rgb2.r * proportion2),
      g: Math.floor(rgb1.g * proportion1 + rgb2.g * proportion2),
      b: Math.floor(rgb1.b * proportion1 + rgb2.b * proportion2)
    };

    return this.rgbToHex(rgbmixed);
  }

  addHexCols(colourStr1, colourStr2, proportion1, proportion2) {
    //console.log(" m i x i n g  "+colourStr1+" & "+colourStr2+", "+proportion1+" / "+proportion2);

    const rgb1 = this.hexToRgb(colourStr1);
    const rgb2 = this.hexToRgb(colourStr2);

    const rgbadded = {
      r: Math.floor(Math.min(255, rgb1.r + rgb2.r)),
      g: Math.floor(Math.min(255, rgb1.g + rgb2.g)),
      b: Math.floor(Math.min(255, rgb1.b + rgb2.b))
    };

    return this.rgbToHex(rgbadded);
  }

  /**
   * Convert a hex string to an object with r, g, and b values.
   * // with thanks to http://stackoverflow.com/users/1047797/david
   * @param  {string} hex     Hex colour string
   * @return {object}         Object of type {r:redValue, g:greenValue, b:blueValue};
   */
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    //console.log("hexToRgb "+hex);
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const hexBreakdown = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const rgbObj = hexBreakdown
      ? {
          r: parseInt(hexBreakdown[1], 16),
          g: parseInt(hexBreakdown[2], 16),
          b: parseInt(hexBreakdown[3], 16)
        }
      : null;

    if (rgbObj === null) {
      throw new Error("tried to rgbify hex " + hex + " but it broke.");
    }

    return rgbObj;
  }

  /**
   * Convert an object with r, g, and b values to a hex string
   * @param  {object} rgbObj  Object with values {r:redValue, g:greenValue, b:blueValue};
   * @return {string}         Hex colour string
   */
  rgbToHex(rgbObj) {
    return (
      "#" +
      this.componentToHex(rgbObj.r) +
      this.componentToHex(rgbObj.g) +
      this.componentToHex(rgbObj.b)
    );
  }

  rgbToBgrHex(rgbObj) {
    return (
      "#" +
      this.componentToHex(rgbObj.b) +
      this.componentToHex(rgbObj.g) +
      this.componentToHex(rgbObj.r)
    );
  }

  /**
   * Helper for rgbToHex, converts each individual colour component to a single hex value
   * @param  {Number} c  A number between 0 and 255
   * @return {string}    The hex equivalent of the provided component
   */
  componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  /**
   * Returns the pico 8 color palette in hex
   */
  pico8HexColors() {
    const colors: string[] = [
      "#1D2B53",
      "#7E2553",
      "#008751",
      "#AB5236",
      "#5F574F",
      "#C2C3C7",
      "#FFF1E8",
      "#FF004D",
      "#FFA300",
      "#FFEC27",
      "#00E436",
      "#29ADFF",
      "#83769C",
      "#FF77A8",
      "#FFCCAA",
      "#000000"
    ];
    return colors;
  }

  /**
   * Returns the pico 8 color palette in hex
   */
  pico8Ints() {
    const hexCols = this.pico8HexColors();
    const parsed: number[] = [];
    for (let i = 0; i < hexCols.length; i++) {
      parsed.push(this.hexToInt(hexCols[i]));
    }
  }
}
