"use strict";
const modelURL = 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

// const modelURL = 'https://teachablemachine.withgoogle.com/models/iPqH_pPou/'; -> First Up, Middle, Down model




let model;
let totalClasses;
let myCanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;

let arrayOfMappedResults = [];

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

async function setup() {
	await load();
}

async function load() {
	model = await tmPose.load(checkpointURL, metadataURL);
	totalClasses = model.getTotalClasses();
	console.log("Number of classes, ", totalClasses);
	loadJSON('http://localhost:3000/api/data', processResults);
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

async function predict(posenetOutput, flipHorizontal = false){
	const prediction = await model.predict(
		posenetOutput,
		flipHorizontal,
		totalClasses
	);
	return prediction;
};

function calculateSuccessRate() {
	let successRates = {};
	
	for (let i = 0; i < arrayOfMappedResults.length; i++) {
	  let folderName = arrayOfMappedResults[i].folderName;
	  let testResult = arrayOfMappedResults[i].testResult;
  
	  if (successRates[folderName]) {
		successRates[folderName].total += 1;
		if (testResult === "successful") {
		  successRates[folderName].success += 1;
		}
	  } else {
		successRates[folderName] = {
		  total: 1,
		  success: testResult === "successful" ? 1 : 0,
		};
	  }
	}
  
	for (let folder in successRates) {
	  let successRate = successRates[folder].success / successRates[folder].total;
	  let successRatePercentage = successRate * 100;
	  console.log(`Success rate for folder ${folder}: ${successRatePercentage}%`);
	}
  }


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
		const confusionMatrix = generateConfusionMatrixPerClass2(folderName);
	  
		// // print the confusion matrix for the current folder
		// console.log(`Confusion matrix for folder "${folderName}":`);
		// console.log("");
	  
		// // print the header row
		// console.log("\t" + Object.keys(confusionMatrix[folderName]).join("\t"));
		
		// // print the data rows
		// for (const label in confusionMatrix) {
		//   console.log(`${label}\t${Object.values(confusionMatrix[label]).join("\t")}`);
		// }
	  
		// console.log("");
	  }
}

function generateConfusionMatrixPerClass2(folderName) {
	// create an object to store the confusion matrix for the current folder
	const confusionMatrix = {
	  [folderName]: { [folderName]: 0, ["not " + folderName]: 0 },
	  ["not " + folderName]: { [folderName]: 0, ["not " + folderName]: 0 }
	};
  
	// iterate over each object in the array
	let truePositives = 0;
	let trueNegatives = 0;
	let falsePositives = 0;
	let falseNegatives = 0;
  
	for (const obj of arrayOfMappedResults) {
	  // get the expected and guessed labels
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
  
	// log the confusion matrix and performance metrics for the current folder
	console.log(`Confusion Matrix for ${folderName}:`);
	console.table(confusionMatrix);
	console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
	console.log(`Sensitivity: ${sensitivity.toFixed(2)}%`);
	console.log(`Specificity: ${specificity.toFixed(2)}%`);
	console.log(`Positive Precision: ${positivePrecision.toFixed(2)}%`);
	console.log(`Negative Precision: ${negativePrecision.toFixed(2)}%`);
  
	// return the confusion matrix for the current folder
	return confusionMatrix;
  }
  