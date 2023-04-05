"use strict";
const modelURL = 'https://teachablemachine.withgoogle.com/models/n4M0b3quT/';

// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

// REPS1 mini 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/'
// REPS 1 'https://teachablemachine.withgoogle.com/models/n4M0b3quT/'

let model;
let totalClasses;


let arrayOfMappedResults = [];
let arrayOfFrameResults = [];

class PoseResult {
	constructor(imageDir, folderName, poses, posenetOutput) {
	  this.imageDir = imageDir;
	  this.folderName = folderName;
	  this.poses = poses;
	  this.posenetOutput = posenetOutput;
	  this.result = [];
	  this.labels = [];
	  this.testResult;
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
				if(this.result[i].probability > highestPer.probability){
					highestPer = this.result[i];
				}
			}
			return highestPer.className;
		}
	}
	compareExpected(){
		if(this.getHighestPercentageLabel() == this.folderName){
			this.testResult = "successful"
		} else {
			this.testResult = "failed"
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

const States = Object.freeze({
	BOTTOM: 'bottom',
	MIDDLE: 'middle',
	TOP: 'top'
  });

  const TransitionStates = Object.freeze({
	UP: 'up',
	DOWN: 'down'
  });

async function setup() {
	await load();
}

async function load() {
	model = await tmPose.load(checkpointURL, metadataURL);
	totalClasses = model.getTotalClasses();
	console.log("Number of classes, ", totalClasses);
	//loadJSON('http://localhost:3000/api/testdata', processResults);
	loadJSON('http://localhost:3000/api/video', processVideo);
}

async function processResults(results){
	let promises = [];
	for (let j = 0; j <= results.length -1 ; j++){
		let imageList = results[j].files;
		let folderName = results[j].folderName
	
		for (let i = 0; i <= imageList.length -1 ; i++) {
			const img = new Image();
			img.src = imageList[i];
			let promise = new Promise(async (resolve) => {
				img.onload = async () => {
				const { pose, posenetOutput } = await model.estimatePose(img, true, 32, 1, 0.5, 20);
					let prediction = await predict(posenetOutput);
					let mappedResult = new PoseResult(imageList[i], folderName, pose, posenetOutput);
					mappedResult.setResults(prediction);
					mappedResult.compareExpected();
					arrayOfMappedResults.push(mappedResult);
					resolve()
			};});
			promises.push(promise)
		}
	}
	await Promise.all(promises);
	let undefinedcount = 0;
	let topcount = 0;
	let middlecount = 0;
	let bottomcount = 0; 
	for (let i = 0; i <= arrayOfMappedResults.length -1 ; i++) {
		if(arrayOfMappedResults[i].poses == undefined){
			console.log(arrayOfMappedResults[i]);
			undefinedcount ++;
		} 
		switch(arrayOfMappedResults[i].getHighestPercentageLabel()){
			case "Top":
				topcount++;
				break;
			case "Middle":
				middlecount++;
				break;
			case "Bottom":
				bottomcount++;
				break; 
		}
	}
	console.log(`Undefined images from PoseNet: ${undefinedcount}.`);
	console.log(`The count for topcount is ${topcount}.`);
	console.log(`The count for middlecount is ${middlecount}.`);
	console.log(`The count for bottomcount is ${bottomcount}.`);
	
	console.log(arrayOfMappedResults);
	printConfusionMatrix(arrayOfMappedResults);
}

async function processVideo(videoFrames){
	let promises = [];
	for (let i = 0; i <= videoFrames.length -1 ; i++) {
		const img = new Image();
		img.src = videoFrames[i];
		let promise = new Promise(async (resolve) => {
			img.onload = async () => {
			// Pose estimation
			const { pose, posenetOutput } = await model.estimatePose(img, true, 32, 1, 0.5, 20);
			// My model estimation
			let prediction = await predict(posenetOutput);
			// Push results to array of objects
			arrayOfFrameResults.push({imageName: videoFrames[i], result: prediction });
			resolve();
		};});
		promises.push(promise)
	}	
	// Once all frames have been estimated 
	await Promise.all(promises);
	// Sort the array in image order (due to the async nature of the app the frames are not ordered)
	let sortedArray = sortArrayByImgName(arrayOfFrameResults);
	// Print the predictions for each frame (e.g. frameimgname + top/bottom/middle predictions)
	printVideoResultsTable(sortedArray);
	// Count repetitions 
	countReps(sortedArray);
}

function printVideoResultsTable(arr){
	const tableData = arr.map((obj) => ({
		imageName: obj.imageName,
		Bottom: obj.result[0].probability,
		Middle: obj.result[1].probability,
		Top: obj.result[2].probability,
	  }));
	  
	  console.table(tableData);
}

async function predict(posenetOutput, flipHorizontal = false){
	// Feeds frame to my model and returns a prediction
	const prediction = await model.predict(
		posenetOutput,
		flipHorizontal,
		totalClasses
	);
	return prediction;
};

function printConfusionMatrix(arr){
	// create an object to store the confusion matrix
	const confusionMatrix = {};

	// iterate over each object in the array
	for (const obj of arr) {
		// get the expected label
		const expectedLabel = obj.folderName;

		// get the guessed label (i.e., the label with the highest percentage)
		const guessedLabel = obj.getHighestPercentageLabel();

		// update the confusion matrix
		if (!confusionMatrix[expectedLabel]) {
			confusionMatrix[expectedLabel] = {};
		}

		if (!confusionMatrix[expectedLabel][guessedLabel]) {
			confusionMatrix[expectedLabel][guessedLabel] = 1;
		} else {
			confusionMatrix[expectedLabel][guessedLabel]++;
		}
	}

	// print the confusion matrix
	console.log("Confusion matrix:\n");

	// print the header row
	let headerRow = "\t";
	for (const label in confusionMatrix) {
	headerRow += `${label}\t`;
	}
	console.log(headerRow);

	// print the data rows
	for (const expectedLabel in confusionMatrix) {
	let dataRow = `${expectedLabel}\t`;
	for (const guessedLabel in confusionMatrix) {
		const count = confusionMatrix[expectedLabel][guessedLabel] || 0;
		dataRow += `${count}\t`;
	}
	console.log(dataRow);
	}

	const folderNames = [...new Set(arr.map(obj => obj.folderName))];
	for (const folderName of folderNames) {
		console.log(folderName)
		const confusionMatrix = generateConfusionMatrixPerClass(folderName);
	}
}

function generateConfusionMatrixPerClass(folderName) {
	// object to store the confusion matrix for the current folder
	const confusionMatrix = {
	  [folderName]: { [folderName]: 0, ["not " + folderName]: 0 },
	  ["not " + folderName]: { [folderName]: 0, ["not " + folderName]: 0 }
	};
  
	let truePositives = 0;
	let trueNegatives = 0;
	let falsePositives = 0;
	let falseNegatives = 0;
  
	for (const obj of arrayOfMappedResults) {
	  const expectedLabel = obj.folderName;
	  const guessedLabel = obj.getHighestPercentageLabel();
  
	  // update the confusion matrix
	  if (expectedLabel === folderName) {
		if (guessedLabel === folderName) {
		  confusionMatrix[folderName][folderName]++;
		  truePositives++;
		} else {
		  confusionMatrix[folderName]["not " + folderName]++;
		  falseNegatives++;
		}
	  } else {
		if (guessedLabel === folderName) {
		  confusionMatrix["not " + folderName][folderName]++;
		  falsePositives++;
		} else {
		  confusionMatrix["not " + folderName]["not " + folderName]++;
		  trueNegatives++;
		}
	  }
	}
  
	// calculate the accuracy, sensitivity, specificity, positive precision, and negative precision
	const accuracy = ((truePositives + trueNegatives) / arrayOfMappedResults.length) * 100;
	const sensitivity = (truePositives / (truePositives + falseNegatives)) * 100;
	const specificity = (trueNegatives / (trueNegatives + falsePositives)) * 100;
	const positivePrecision = (truePositives / (truePositives + falsePositives)) * 100;
	const negativePrecision = (trueNegatives / (trueNegatives + falseNegatives)) * 100;
  
	console.log(`Confusion Matrix for ${folderName}:`);
	console.table(confusionMatrix);
	console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
	console.log(`Sensitivity: ${sensitivity.toFixed(2)}%`);
	console.log(`Specificity: ${specificity.toFixed(2)}%`);
	console.log(`Positive Precision: ${positivePrecision.toFixed(2)}%`);
	console.log(`Negative Precision: ${negativePrecision.toFixed(2)}%`);
  
	return confusionMatrix;
}

function countReps(arr){
	  let currentState = States.BOTTOM;
	  let repCount = 0;
	  let transitioningUpCount = 0;

	  for (let i = 0; i < arr.length; i++) {
		const bottomProb = arr[i].result[0].probability;
		const middleProb = arr[i].result[1].probability;
		const topProb = arr[i].result[2].probability;

		switch(currentState){
			case States.BOTTOM:
				if(topProb > 0.7 || bottomProb > 0.7){
					// Unlikely that when in bottom we will automatically get a top probability so probably an error
					// If already in bottom then maintain
					continue;
				}
				if(bottomProb < 0.7) {
					// if the bottom prob is less than 70%, it must be a high middle probability, change state
					currentState = States.MIDDLE
				}
				break;
			case States.MIDDLE:
				if(middleProb > 0.7){
					// Reset transitioning up, a middle was detected
					transitioningUpCount = 0; 
					// Still a middle probability
				}
				if(bottomProb > 0.7){
					transitioningUpCount = 0; 
					// Prepare for a transition towards bottom. We need code here to wait to confirm that we are indeed going bottom
				}
				if(topProb > 0.7){
					transitioningUpCount ++; 
					if(transitioningUpCount >= 2) {
						transitioningUpCount = 0; 
						currentState = States.TOP;
					}
					// Prepare for a transition towards up. We need code here to wait to confirm that we are indeed going up
				}
				break;
			case States.TOP:
				if(topProb > 0.7 || bottomProb > 0.7){
					continue; 
				}
				if(middleProb > 0.7){
					repCount++;
					currentState = States.MIDDLE;
				}

				break;
		}
	  }
	  console.log('Number of pull-up reps:', repCount);
}

function sortArrayByImgName(arrayOfFrameResults) {
	return arrayOfFrameResults.sort((obj1, obj2) => {
	  const num1 = parseInt(obj1.imageName.match(/\d+\.png$/)[0].slice(0, -4)); // extract the number from the imageName of obj1
	  const num2 = parseInt(obj2.imageName.match(/\d+\.png$/)[0].slice(0, -4)); // extract the number from the imageName of obj2
	  return num1 - num2; // sort by ascending order of the numbers
	});
  }
  