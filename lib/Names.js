"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Names {
    constructor() {
        this.json = JSON.parse(fs_1.readFileSync("data/corpus.json", "utf8"));
    }
    getName() {
        let nameString = "";
        if (this.json.corpus.length == 0) {
            this.json.corpus = this.json.used;
            this.json.used = [];
        }
        const word1 = this.json.corpus.shift();
        const word2 = this.json.corpus.shift();
        const word3 = this.json.corpus.shift();
        const word4 = this.json.corpus.shift();
        this.json.used.push(word4, word3, word2, word1);
        nameString = word1 + word2 + word3 + word4;
        const toWrite = JSON.stringify(this.json);
        fs_1.writeFile("data/corpus.json", toWrite, "utf8", function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("corpus updated.");
            }
        });
        return nameString;
    }
}
exports.default = Names;
