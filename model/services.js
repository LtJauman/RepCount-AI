"use strict";
// Ada Boilerplate - JavaScript and Computer Vision Teachable Machine,
// Machine Learning & Teachable Machine Models

//for easy lets setup some quick global variables
var imageModelURL = 'https://teachablemachine.withgoogle.com/models/VUHqJPevq/'; //variable used to hold path to the model
var classifier; //variable used to hold the classifier object

var cam; //variable used to hold the camera object
var label0 = "", confidence0 = 0; //for ease and just because we're only demo'ing with two classes
var label1 = "", confidence1 = 0;

function preload() {
	//p5 function - this function is automatically called by the p5 library, once only
	classifier = ml5.imageClassifier(imageModelURL + 'model.json'); //load the model!
}


function setup() {
	//p5 function - this function is autmaticallt called after the 'preload' function; the function is only executed once
	var viewport = createCanvas(480, 360);//p5 function to create a p5 canvas 
	viewport.parent('video_container'); //attach the p5 canvas to the target html div
	frameRate(24); //set the frame rate, we dont need to high performance video

	cam = createCapture(VIDEO);//p5 function, store the video information coming from the camera
	cam.hide();//hide the cam element

	classify(); //start the classifer
	getImages();
	//getImagesByFolderDir("C:/Users/User/Videos/Captures/Pull_ups/Testing data/B");
}


function classify() {
	//ml5, classify the current information stored in the camera object
	classifier.classify(cam, processresults); //once complete execute a callback to the processresults function
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
	//p5 function - this function is automatically called every frame
	background("#c0c0c0"); //set the canvas default back colour

	image(cam, 0, 0); //pass the video to the p5 canvas
	document.getElementById("results").innerHTML = friendlyresults(); //update the result string
}


function getImages() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'C:/Users/User/Videos/Captures/Pull_ups/Testing data/B');
	xhr.onload = function() {
	  if (xhr.status === 200) {
		var fileNames = [];
		var files = xhr.responseXML.getElementsByTagName('a');
		for (var i = 0; i < files.length; i++) {
		  var fileName = files[i].textContent;
		  if (fileName.endsWith('.png')) {
			fileNames.push(fileName);
		  }
		}
		console.log(fileNames);
	  }
	};
	xhr.send();
  }
  
function getImagesByFolderDir(folderDir) {
	const folderPath = path.join(__dirname, folderDir);
	const images = [];
  
	fs.readdirSync(folderPath).forEach(file => {
	  images.push(file);
	});
  
	console.log(images);
  }

const fs = require('fs');
const path = require('path');

function getImagesByFolderDir(folderDir) {
  const folderPath = path.join(__dirname, folderDir);
  const images = [];

  fs.readdirSync(folderPath).forEach(file => {
    images.push(file);
  });

  return images;
}

// Example usage:
const images = getImagesByFolderDir('all_pictures');
console.log(images); // array of image file names in the "all_pictures" directory
