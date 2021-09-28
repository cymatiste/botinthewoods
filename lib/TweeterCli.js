"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const Twit = require("twit");
const configPath = "../config";
function getConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.existsSync(configPath)) {
            return yield Promise.resolve().then(() => require(configPath));
        }
        else {
            console.error(`Requires a config file at ${path_1.resolve(__dirname, configPath + ".js")}`);
            process.exit();
        }
    });
}
const T = new Twit(getConfig());
const threading = false;
let firstRun = true;
let tweetables, tweeteds, status;
/**
 * Do it.
 * @return {void}
 */
function tweetAForest() {
    tweetables = JSON.parse(fs_1.readFileSync("data/tweetables.json", "utf8"));
    tweeteds = JSON.parse(fs_1.readFileSync("tweeteds.json", "utf8"));
    if (tweetables.gifNames.length == 0) {
        console.log("...no GIFs yet, try again...");
        return;
    }
    const gifName = tweetables.gifNames.shift();
    tweeteds.tweeted.push(gifName);
    const filePath = path_1.join(__dirname, "/images/", gifName + ".gif");
    if (tweetables.quotes.length > 0) {
        status = tweetables.quotes.shift();
    }
    else {
        status = "";
        tweetables.replyTo = "";
    }
    // Upload the GIF
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data);
            const replyId = tweetables.replyTo;
            let params;
            if (threading && replyId !== null && replyId.length > 0) {
                status = "@botinthewoods \n" + status;
                params = {
                    status: status,
                    media_ids: [data.media_id_string],
                    encoding: "base64",
                    in_reply_to_status_id: replyId
                };
            }
            else {
                params = {
                    status: status,
                    media_ids: [data.media_id_string],
                    encoding: "base64"
                };
            }
            // Tweet the GIF
            T.post("statuses/update", params, function (err, data, response) {
                if (err !== undefined) {
                    console.log(err);
                }
                else {
                    console.log("Tweeted: " + params.status + ", " + data);
                    if (threading && tweetables.quotes.length > 0) {
                        tweetables.replyTo = data.id_str;
                    }
                    else {
                        tweetables.replyTo = "";
                    }
                    const tweetablesToWrite = JSON.stringify(tweetables);
                    const tweetedsToWrite = JSON.stringify(tweeteds);
                    fs_1.writeFile("data/tweetables.json", tweetablesToWrite, "utf8", function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("tweetables updated at " + getDateTime());
                            fs_1.writeFile("tweeteds.json", tweetedsToWrite, "utf8", function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("tweeteds updated at " + getDateTime());
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
/**
 * c/o Ionică Bizău
 * @return {string} the date and time in the following format: YYYY:MM:DD:HH:MM:SS
 */
function getDateTime() {
    const date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}
function tweetEveryThisManyMinutes(mins) {
    setInterval(tweetAForest, mins * 60 * 1000);
    if (firstRun) {
        tweetAForest();
    }
}
process.argv.forEach((val, index) => {
    if (val == "true" || val == "false") {
        firstRun = eval(val);
        console.log("firstRun: " + firstRun);
    }
});
tweetEveryThisManyMinutes(220);
