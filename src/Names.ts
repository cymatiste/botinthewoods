import { readFileSync, writeFile } from "fs";

export default class Names {
  json = JSON.parse(readFileSync("data/corpus.json", "utf8"));

  getName() {
    let nameString = "";

    if (this.json.corpus.length == 0) {
      this.json.corpus = this.json.used;
      this.json.used = [];
    }

    const word1 = this.json.corpus.shift();
    const word2 = this.json.corpus.shift();
    const word3 = this.json.corpus.shift();

    this.json.used.push(word1, word2, word3);
    nameString = word1 + word2 + word3;

    const toWrite = JSON.stringify(this.json);

    writeFile("data/corpus.json", toWrite, "utf8", function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("corpus updated.");
      }
    });

    return nameString;
  }
}
