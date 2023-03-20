"use strict";
const modelURL = 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

// var imageModelURL = 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/'; //variable used to hold path to the model
// Image: https://teachablemachine.withgoogle.com/models/VUHqJPevq/
// My pose model: https://teachablemachine.withgoogle.com/models/iPqH_pPou/
var classifier; //variable used to hold the classifier object
let count = 0;
let model;
let totalClasses;
let myCanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;

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

class PoseResult {
	constructor(imageDir, folderName, poses, posenetOutput) {
	  this.imageDir = imageDir;
	  this.folderName = folderName;
	  this.poses = poses;
	  this.posenetOutput = posenetOutput;
	  this.result = [];
	  this.labels = [];
	}
	setResults(arr){
		if (arr.length > 0){
			this.result = arr;
			for(let i = 0; i <= this.result.length -1 ; i++){
				this.labels.push(this.result[i].className)
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
				stringifiedResults = stringifiedResults + this.result[i].className + ": " + (this.result[i].probability*100).toFixed(0) + "%" + ", "
			}
			console.log("Image with Url: " + this.imageDir + " " +stringifiedResults)
		}
	}
}

async function load() {
	model = await tmPose.load(checkpointURL, metadataURL);
	totalClasses = model.getTotalClasses();
	console.log("Number of classes, ", totalClasses);
	loadJSON('http://localhost:3000/api/data', processResults);
}

function processResults(results){
	count = 0;
	let folderName = results[0].folderName;
	let imageList = results[0].files;
	for (let i = 0; i <= imageList.length -1 ; i++) {
		const img = new Image();
		img.src = imageList[i];
		img.onload = async () => {
		const { pose, posenetOutput } = await model.estimatePose(img, true, 32, 1, 0.5, 20);
			let prediction = await predict(posenetOutput)
			let mappedResult = new PoseResult(imageList[i], folderName, pose, posenetOutput);
			mappedResult.setResults(prediction);
			arrayOfMappedResults.push(mappedResult);
		};
	}
}

async function setup() {
	await load();
	console.log(arrayOfMappedResults)
}

async function predict(posenetOutput, flipHorizontal = false){
	const prediction = await model.predict(
		posenetOutput,
		flipHorizontal,
		totalClasses
	);
	return prediction;
}