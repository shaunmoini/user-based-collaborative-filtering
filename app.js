const fs = require('fs/promises');
const rl = require('readline/promises').createInterface({
  input: process.stdin,
  output: process.stdout
});

// removes a specified index from a given array
function removeIndex(arr, i) {
  return arr.slice(0, i).concat(arr.slice(i + 1));
}

// returns the n nearest neighbours
function getNearestNeighbours(arr, n) {
  arr.sort((a, b) => { return b.correlation - a.correlation });
  return arr.slice(0, n);
}

// returns indices of array that match value
function getMatchingIndicies(arr, val) {
  var indicies = [];
  for (let i = 0; i < arr.length; i++)
    if (arr[i] == val)
      indicies.push(i);

  return indicies;
}

// returns the sets of items that both user a and b have rated
function getCommonSet(a, b) {
  let setA = [];
  let setB = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] != -1 && b[i] != -1) {
      setA.push(a[i]);
      setB.push(b[i]);
    }
  }

  return [setA, setB];
}

function mean(arr) {
  let filteredArr = arr.filter((x) => { return x != -1 })
  return filteredArr.reduce((a, b) => a + b) / filteredArr.length;
}

function standardDev(arr, avg) {
  let filteredArr = arr.filter((x) => { return x != -1 });
  return Math.sqrt(filteredArr.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b));
}

// calculates sim(a, b) and returns an array of objects representing 
function getSimilarity(user, users) {
  let similarities = [];
  let userMean = mean(user.ratings);

  for (let i = 0; i < users.length; i++) {
    let commonSet = getCommonSet(user.ratings, users[i].ratings);
    let a = commonSet[0];
    let b = commonSet[1];

    let numerator = 0;
    let denominator = standardDev(a, userMean) * standardDev(b, mean(users[i].ratings));
    for (let j = 0; j < a.length; j++) numerator += (a[j] - userMean) * (b[j] - mean(users[i].ratings));

    let result = denominator != 0 ? numerator / denominator : 0;
    similarities.push({ user: users[i].user, ratings: users[i].ratings, correlation: result });
  }

  return similarities;
}

// calculates pred(a, p) and returns array with -1 values replaced with predicited value
function getPrediction(user, users) {
  let prediction = [...user.ratings];
  let unratedItems = getMatchingIndicies(prediction, -1);
  let userMean = mean(user.ratings);

  for (let i = 0; i < unratedItems.length; i++) {
    let numerator = 0;
    let denominator = 0;
    for (let j = 0; j < users.length; j++) {
      numerator += users[j].correlation * (users[j].ratings[unratedItems[i]] - mean(users[j].ratings));
      denominator += users[j].correlation;
    }

    prediction[unratedItems[i]] = userMean + (numerator / denominator);
  }

  return prediction
}

async function main() {
  try {
    // prompting user for input file and neighbourhood size
    let filePath = await rl.question('Enter path to input file: ');
    let neighbourhoodSize = await rl.question('Enter neighbourhood size: ');
    let inputFile = await fs.readFile(filePath);

    // parsing the input file
    let inputFileArray = inputFile.toString().trim().split('\n');
    inputFileArray.forEach((cur, i, arr) => { arr[i] = cur.trim().split(' '); });

    // further parsing the input file by extracting user ratings and creating an array of objects
    let ratingsMatrix = inputFileArray.slice(3);
    ratingsMatrix.forEach((cur, i, arr) => { arr[i] = { user: i, ratings: cur.map(Number) }; });

    // iterating through ratings matrix and checking if an unrated product exists. If so, calculate the predicted rating...
    let completedMatrix = [];
    for (let i = 0; i < ratingsMatrix.length; i++) {
      if (ratingsMatrix[i].ratings.includes(-1)) {
        let similarity = getSimilarity(ratingsMatrix[i], removeIndex(ratingsMatrix, i));
        let prediction = getPrediction(ratingsMatrix[i], getNearestNeighbours(similarity, neighbourhoodSize));

        completedMatrix.push(prediction);
      }
      else {
        completedMatrix.push(ratingsMatrix[i].ratings);
      }
    }

    // outputting completed matrix to console
    for (let x of completedMatrix) console.log(...x);
    main();
  }
  catch (e) {
    console.log(e);
    main();
  }
}

main();