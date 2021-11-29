# botinthewoods

[![@botinthewoods](https://img.shields.io/twitter/follow/botinthewoods.svg?label=botinthewoods&style=social)](https://twitter.com/botinthewoods)

## This is a work in progress!

Generate and tweet an animated GIF of a little forest walk-through!

God bless all the people who made npm and the node modules I used to throw this together.

Special shout-out to Ty Dira https://github.com/tydira who converted this project to TypeScript!  (we're still working on it)

I haven't put any time yet into making it friendly for others to use.  With any luck this will get refactored as I continue to play with it to make it more flexible for adaptation to other purposes.

Feedback and suggestions are more than welcome; tweet or dm them to https://twitter.com/cymatiste.

## To replicate:
- install node
- create a folder named 'images' in the project folder.
- In the project folder, cmd > `npm install`
- you can generate the scenes without a developer twitter account but if you want to tweet them you'll need one.  You'll also have to add a config.js in the project folder containing the following:

```
var config = {
    consumer_key: '__YOUR_CONSUMER_PUBLIC_KEY_HERE__',
    consumer_secret: '__YOUR_CONSUMER_SECRET_KEY_HERE__',
    access_token: '__YOUR_PUBLIC_ACCESS_TOKEN_HERE__',
    access_token_secret: '__YOUR_SECRET_ACCESS_TOKEN_HERE__'
}
module.exports = config;
```

**To generate forest GIFs:**
- add a file 'data/tweetables.json' in the project folder with content:
```
{ gifNames: [] }
```
- cmd > `node bin/gifmaker.js`

 (Inside this file you can set the number of frames to output.  I might eventually expose a bunch more options in here and make them command line parameters as well.)

**To tweet GIFs you've already created:**
- cmd > `node bin/tweeter.js`

You can run *gifmaker* and *tweeter* simultaneously in different consoles to keep the ball rolling.

All the actual work is done in src/ForestGenerator.js, with some help with the heavy lifting from src/Colors.js.  Again, this might get broken up further eventually into useful subfiles.


If you get "Javascript heap out of memory" errors, these instructions might help:
https://medium.com/@vuongtran/how-to-solve-process-out-of-memory-in-node-js-5f0de8f8464c
 ... Do you know a better way to manage memory in node?  I'm a total node newbie; let's talk.


## MIT License:
Copyright 2018 Sarah Imrisek

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
