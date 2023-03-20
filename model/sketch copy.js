const modelURL = 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

let model;
let totalClasses;
let myCanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;


// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
  console.log("Number of classes, ", totalClasses);
}


async function setup() {
  myCanvas = createCanvas(400, 400);
  // Call the load function, wait until it finishes loading
  videoCanvas = createCanvas(320, 240)

  await load();
  video = createCapture(VIDEO, videoReady);
  video.size(320, 240);
  video.hide();

}

function draw() {
  background(255);
  if(video) image(video,0,0);
  fill(255,0,0)
  textSize(18);
  text("Result:" + classification, 10, 40);

  text("Probability:" + probability, 10, 20)
  ///ALEX insert if statement here testing classification against apppropriate part of array for this time in your video

  textSize(8);
  if (poser) { //did we get a skeleton yet;
    for (var i = 0; i < poser.length; i++) {
      let x = poser[i].position.x;
      let y = poser[i].position.y;
      ellipse(x, y, 5, 5);
      text(poser[i].part, x + 4, y);
    }
  }

}

function videoReady() {
  console.log("Video Ready");
  predict();
}


async function predict() {
    const img = new Image();
    img.src = 'images/Bottom/resized.png';

    img.onload = async () => {
    const { pose, posenetOutput } = await model.estimatePose(img, true, 32, 1, 0.5, 20);
    console.log(pose)
    };
}