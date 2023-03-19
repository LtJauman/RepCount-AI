const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pass to next layer of middleware
  next();
});

app.get('/api/data', (req, res) => {  
  const results = getFoldersAndImagesInDir('images');
  res.send(results);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

function getFoldersAndImagesInDir(parentDir) {
  const folderPaths = getFoldersInDir(parentDir);

  const folderData = folderPaths.map(folderPath => {
    const folderName = folderPath.split('/').pop();
    const imagePaths = getImagesByFolderDir(`${parentDir}/${folderName}`);

    const formattedImagePaths = imagePaths.map(imagePath => `${parentDir}/${folderName}/${imagePath}`);

    return {
      folderName: `${folderName}`,
      files: formattedImagePaths
    };
  });

  return folderData;
}


function getFoldersInDir(parentDir) {
  const directoryPath = `${__dirname}/${parentDir}`;
  const files = fs.readdirSync(directoryPath);

  const folderNames = files.filter(file => {
    const filePath = `${directoryPath}/${file}`;
    return fs.statSync(filePath).isDirectory();
  }).map(folder => `${parentDir}/${folder}`);

  return folderNames;
}

function getImagesByFolderDir(folderDir) {
  const directoryPath = `${__dirname}/${folderDir}`;
  const files = fs.readdirSync(directoryPath);

  const pngFiles = files.filter(file => file.endsWith('.png'));

  return pngFiles;
} 