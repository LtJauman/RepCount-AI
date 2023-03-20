"use strict";
//express = require('express')
// Ada Boilerplate - JavaScript and Computer Vision Teachable Machine,
// Machine Learning & Teachable Machine Models

//for easy lets setup some quick global variables
var imageModelURL = 'https://teachablemachine.withgoogle.com/models/VUHqJPevq/'; //variable used to hold path to the model
// Image: https://teachablemachine.withgoogle.com/models/VUHqJPevq/
// My pose model: https://teachablemachine.withgoogle.com/models/iPqH_pPou/
var classifier; //variable used to hold the classifier object
let count = 0;

let arrayOfMappedResults = [];
let loadedImages = [];

class Result {
	constructor(imageDir, image, folderName) {
	  this.imageDir = imageDir;
	  this.image = image;
	  this.result = [];
	  this.labels = [];
	  this.folderName = folderName;
	}
	setArray(arr){
		if (arr.length > 0){
			this.result = arr;
			for(let i = 0; i <= this.result.length -1 ; i++){
				this.labels.push(this.result[i].label)
			}
		}	
	}
	getHighestPercentageLabel(){
		
		if(this.result.length > 0){
			let highestPer = this.result[0];
			for(let i = 0; i <= this.result.length -1 ; i++){
				if(this.result[i].confidence > highestPer.confidence){
					highestPer = this.result[i];
				}
			}
			return highestPer;
		}
	}
	logFormattedValues(){
		if(this.result.length > 0){
			let stringifiedResults = "";
			for(let i = 0; i <= this.result.length -1 ; i++){
				stringifiedResults = stringifiedResults + this.result[i].label + ": " + (this.result[i].confidence*100).toFixed(0) + "%" + ", "
			}
			console.log("Image with Url: " + this.imageDir + " " +stringifiedResults)
		}
	}
}
  

function preload() {
	//p5 function - this function is automatically called by the p5 library, once only
	loadJSON('http://localhost:3000/api/data', processResults);
	classifier = ml5.imageClassifier(imageModelURL + 'model.json'); //load the model!
}

function processResults(results){
	count = 0;
	let folderName = results[0].folderName;
	let imageList = results[0].files;
	for (let i = 0; i <= imageList.length -1 ; i++) {
		let loadedImage = loadImage(imageList[i]);
		loadedImages.push(loadedImage);
		let mappedResult = new Result(imageList[i], loadedImage, folderName);	
		arrayOfMappedResults.push(mappedResult);
	}
}

function setup() {
	requestresults(loadedImages);
	console.log(arrayOfMappedResults);
}

function requestresults(images){
	for(let i = 0; i <= images.length -1 ; i++){
		classifier.classify(images[i], processresults);
	}
}

function processresults(error, results) {
	//a simple way to return the current classification details
	if (error) { //something seems to have gone wrong
		console.error("classifier error: " + error);
	} else { //no errors detected, so lets grab the label and execute the classify function again
		arrayOfMappedResults[count].setArray(results);
		count++;
		//console.log("count is now: ", count);
	}
}

function draw() {
	//p5 function - this function is automatically called every frame
	//background("#c0c0c0"); //set the canvas default back colour
	//image(cam, 0, 0); //pass the video to the p5 canvas
	//document.getElementById("results").innerHTML = friendlyresults(); //update the result string
}