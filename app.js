const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
  
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    image.quality(100).write(outputFile);
  
    console.log('You have successfully added watermark to Your image!')
    startApp();
  }
  catch(error) {
    console.log(error);
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);

  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  image.quality(100).write(outputFile);

  console.log('You have successfully added watermark to Your image!')
  startApp();
}
catch (error) {
  console.log(error);
}
};

const makeImageBrighter = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
  
    image.brightness(0.2);
    image.quality(100).write(outputFile);
  }
  catch(error) {
    console.log(error);
  }
};

const flipImage = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
  
    image.mirror(true, false);
    image.quality(100).write(outputFile);
  }
  catch(error) {
    console.log(error);
  }
};

const increaseContrast = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
  
    image.contrast(0.1);
    image.quality(100).write(outputFile);
  }
  catch(error) {
    console.log(error);
  }
};

const makeBlackWhite = async function(inputFile, outputFile) {
  try {
    const image = await Jimp.read(inputFile);
  
    image.greyscale();
    image.quality(100).write(outputFile);
  }
  catch(error) {
    console.log(error);
  }
};

const prepareOutputFilename = (fileName) => {

  fileNameParts = fileName.split('.');
  
  const name = fileNameParts[0];
  const extension = fileNameParts[1];

  return `${name}-with-watermark.${extension}`
};

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
    name: 'start',
    type: 'confirm',
    message: 'Hi! Welcome to "Watermark manager". Copy  your image files to \'img\' folder. Then you\'ll be able to use them in the app. Are you ready?',
  }]);

  // if answer is no. just quit the app
  if (!answer.start) process.exit();

  //ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do You want to mark?',
    default: 'test.jpg',
  }
]);

  //ask about additional edits to the file
  const editsConfirmation = await inquirer.prompt([{
    name: 'additionalEdits',
    type: 'confirm',
    message: 'Would You like to do any additional edits to the image?',
    default: 'n',
  }]);

  if (editsConfirmation.additionalEdits) {
    const editsChoice = await inquirer.prompt([{
      name: 'edit',
      type: 'list',
      choices: ['make image brighter', 'increase contrast', 'make image b&w', 'invert image']
    }]);

    if (editsChoice.edit === 'make image brighter') {
      if (fs.existsSync('./img/' + options.inputImage)) {
        makeImageBrighter('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      }
      else {
        console.log('Something went wrong... Try again.')
      }
    }
    else if (editsChoice.edit === 'increase contrast') {
      if (fs.existsSync('./img/' + options.inputImage)) {
        increaseContrast('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      }
      else {
        console.log('Something went wrong... Try again.')
      }
    }
    else if (editsChoice.edit === 'make image b&w') {
      if (fs.existsSync('./img/' + options.inputImage)) {
        makeBlackWhite('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      }
      else {
        console.log('Something went wrong... Try again.')
      }
    }
    else if (editsChoice.edit === 'invert image') {
      if (fs.existsSync('./img/' + options.inputImage)) {
        flipImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage));
      }
      else {
        console.log('Something went wrong... Try again.')
      }
    }
  };

  const typeOptions = await inquirer.prompt([{
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark']
  }]);

  if (typeOptions.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text: ',
    }]);
    typeOptions.watermarkText = text.value;
    if (fs.existsSync('./img/' + options.inputImage)) {
      addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
    }
    else {
      console.log('Something went wrong... Try again.')
    }
  } 
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name: ',
      default: 'logo.png',
    }]);
    options.watermarkImage = image.filename;
    if (fs.existsSync('./img/' + options.inputImage) && fs.existsSync('./img/' + options.watermarkImage)) {
      addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
    }
    else {
      console.log('Something went wrong... Try again.')
    }
  };
};

startApp();