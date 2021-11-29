"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Randoms {
    //### Make random more readable #########################################3
    /**
     * with one parameter: return an integer between 0 and a (excluding a)
     * with two parameters: Return an integer between a and b (excluding b)
     */
    randomInt(a, b) {
        return Math.floor(this.random(a, b));
    }
    /**
     * with one parameter: return a decimal number between 0 and a
     * with two parameters: return a decimal number between a and b
     */
    random(a, b) {
        var bottom, top;
        if (b == null) {
            bottom = 0;
            top = a;
        }
        else {
            bottom = a;
            top = b;
        }
        return bottom + Math.random() * (top - bottom);
    }
    /**
     * Return a random element in the array
     */
    randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    /**
     * Return the number randomly positive or negative
     */
    randomSign(num) {
        return num * (Math.random() > 0.5 ? 1 : -1);
    }
    shuffle(array) {
        var i = 0, j = 0, temp = null;
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}
exports.default = Randoms;
