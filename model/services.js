"use strict";
// Ada Boilerplate - JavaScript and Computer Vision Teachable Machine,
// Machine Learning & Teachable Machine Models

//for easy lets setup some quick global variables
var imageModelURL = 'https://teachablemachine.withgoogle.com/models/VUHqJPevq/'; //variable used to hold path to the model
// Image: https://teachablemachine.withgoogle.com/models/VUHqJPevq/
// My pose model: https://teachablemachine.withgoogle.com/models/iPqH_pPou/
var classifier; //variable used to hold the classifier object

var cam; //variable used to hold the camera object
var label0 = "", confidence0 = 0; //for ease and just because we're only demo'ing with two classes
var label1 = "", confidence1 = 0;
let myimage;
let loadedImages = [];

function preload() {
	//p5 function - this function is automatically called by the p5 library, once only
	classifier = ml5.imageClassifier(imageModelURL + 'model.json'); //load the model!
	myimage = loadImage("B/37putput_0001.png");
	const imageList = [
		"B/37putput_0001.png",
		"B/37putput_0002.png",
		"B/37putput_0003.png",
	  ];
	  for (let i = 0; i <= imageList.length -1 ; i++) {
		console.log(imageList[i])
		let img = loadImage(imageList[i]);
		loadedImages.push(img);
	  }
	  console.log(loadedImages)
	  requestresults(loadedImages);
	// let imageList = loadStrings('B');
	// let images; 
	// // loop through the list to load each image
	// for (let i = 0; i < imageList.length; i++) {
	// 	console.log("here")
	// 	console.log(imageList[i])
	//   // load each image and add it to the images array
	//   let imagePath = 'B/' + imageList[i];
	//   let image = loadImage(imagePath);
	//   images.push(image);
	// }

}


function setup() {
	//p5 function - this function is autmaticallt called after the 'preload' function; the function is only executed once
	var viewport = createCanvas(480, 360);//p5 function to create a p5 canvas 
	//viewport.parent('video_container'); //attach the p5 canvas to the target html div
	//frameRate(24); //set the frame rate, we dont need to high performance video

	//cam = createCapture(VIDEO);//p5 function, store the video information coming from the camera
	//cam.hide();//hide the cam element
	
	//classify(); //start the classifer
	//getImages();
	//getImagesByFolderDir("C:/Users/User/Videos/Captures/Pull_ups/Testing data/B");
}


function classify() {
	//ml5, classify the current information stored in the camera object
	//let image = createImg("C:\\Users\\User\\Documents\\GitHub\\RepCount-AI\\model\\B\\37putput_0120.png", "a picture")
	let img = 
	classifier.classify(myimage, processresults); //once complete execute a callback to the processresults function
	console.log(friendlyresults())
}

function requestresults(images){
	for(let i = 0; i <= images.length -1 ; i++){
		classifier.classify(images[i], processresults);
	}
	console.log(label0)
}


function processresults(error, results) {
	//a simple way to return the current classification details
	if (error) { //something seems to have gone wrong
		console.error("classifier error: " + error);
	} else { //no errors detected, so lets grab the label and execute the classify function again
		label0 = results[0].label; confidence0 = results[0].confidence;
		label1 = results[1].label; confidence1 = results[1].confidence;
		classify(); //execute the classify function again
	}
}


function friendlyresults() {
	//a simple way to return the current classification details
	let result = "Please wait...";
	if(label0.length > 0) {
		result = label0 + ": " + (confidence0*100).toFixed(0) + "%" + ", " + label1 + ": " + (confidence1*100).toFixed(0) + "%";
	}
	return result;
}


function draw() {
	//console.log(friendlyresults())
	//p5 function - this function is automatically called every frame
	background("#c0c0c0"); //set the canvas default back colour

	//image(cam, 0, 0); //pass the video to the p5 canvas
	//document.getElementById("results").innerHTML = friendlyresults(); //update the result string
}