/********************
/ CONFIGURATION
/ Edit the variables below to configure your gif.
*********************/

const CANVAS_WIDTH = 300 // The width of the canvas
const CANVAS_HEIGHT = 300; // The height of the canvas
const FRAME_COUNT = 30; // The number of frames
const FPS = 15; // Frames per second.
const LOOPS = 0; // 0 = loop forever.
// Whether to clear the canvas after drawing each frame.
const CLEAR_EACH_FRAME = true;

//The DRAW_FRAME function is where you define what a frame should look like. It receives a 2D rendering context as its first argument, and a frame counter as its second. The frame counter starts at 0 for the first frame, and increases by 1 every time the function is called for drawing subsequent frames, up to FRAME_COUNT - 1.
const DRAW_FRAME = (ctx, frame) => {
  // Your implementation goes here.
  // Here's an example that renders a circle that
  // grows and shrinks.
  let scale = Math.abs(frame - FRAME_COUNT/2) / (FRAME_COUNT/2);
  let radius = scale * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) / 2;
  let circleX = CANVAS_WIDTH / 2;
  let circleY = CANVAS_HEIGHT / 2;
  
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

// NO NEED TO EDIT ANYTHING FROM HERE.
// although feel free, if you want to :).

// Set up the canvas.
let can = document.createElement("canvas");
let ctx = can.getContext("2d");
can.width = CANVAS_WIDTH;
can.height = CANVAS_HEIGHT;

// Configure an encoder.
let encoder = new GIFEncoder();
encoder.setRepeat(LOOPS);
encoder.setDelay(1000 / FPS);

// This is where the magic happens. ✨
encoder.start();
for (let i=0; i < FRAME_COUNT; i++){
  console.log("frame " + i);
  DRAW_FRAME(ctx, i);
  encoder.addFrame(ctx);
  if (CLEAR_EACH_FRAME) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

encoder.finish();
let binary_gif = encoder.stream().getData()
let data_url = 'data:image/gif;base64,'+encode64(binary_gif);

let image = document.createElement("img");
image.src = data_url;

document.body.appendChild(image);

let download = document.createElement("button");
download.innerText = "download GIF";
download.style = "display:block;background-color:green;color:white;font-size:2em;";

download.addEventListener("click", () => {
  encoder.download("animation.gif");
});

document.body.appendChild(download);

