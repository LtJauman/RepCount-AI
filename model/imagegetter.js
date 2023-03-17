const TeachableMachine = require("@sashido/teachablemachine-node");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/r6BBk-hiN/"
});

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
const images = getImagesByFolderDir('B');
console.log(images); // array of image file names in the "all_pictures" directory




