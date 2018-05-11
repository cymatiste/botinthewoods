
Generate and tweet an animated GIF of a little forest walk-through!

This project is distributed under an MIT license (see below).

God bless all the people who made npm and the node modules I used to throw this together.

## To replicate:
- install node
- make a developer twitter account (there are lots of tutorials around on how to do this) and add a config.js in the root folder containing the following:

```
var config = {
    consumer_key: '__YOUR_CONSUMER_PUBLIC_KEY_HERE__',
    consumer_secret: '__YOUR_CONSUMER_SECRET_KEY_HERE__',
    access_token: '__YOUR_PUBLIC_ACCESS_TOKEN_HERE__',
    access_token_secret: '__YOUR_SECRET_ACCESS_TOKEN_HERE__'
}
module.exports = config;
```

Then run:
- cmd > npm install
- cmd > node bot.js

This will tweet every 15 minutes by default.
If you want to test out creating GIFs without tweeting them, use js/test.js

If you get "Javascript heap out of memory" errors, these instructions might help:
https://medium.com/@vuongtran/how-to-solve-process-out-of-memory-in-node-js-5f0de8f8464c


## Misc notes:

This is a work in progress! Please send any comments or suggestions to sarah at xstnt dot net.

You'll find a bunch of unused stuff in here too: 
- an older web version of the tree generator with some exposed variables.  
- skeletal functions in bot.js to handle responding to tweets; not being used right now but I might use them later so I'm not taking them out just yet.


## License:
Copyright 2018 Sarah Imrisek

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
