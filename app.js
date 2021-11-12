const fs = require('fs/promises');
const rl = require('readline/promises').createInterface({
  input: process.stdin,
  output: process.stdout
});

function getCommonIndices(a, b) {
  let indices = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] == -1 || b[i] == -1) continue;
    indices.push(i);
  }
  return indices;
}

function sum(array) {
  let sum = 0;
  for (let x of array) {
    if (x != -1) sum += x;
  }
  return sum;
}

function mean(array) {
  let n = 0;
  for (let x of array) {
    if (x != -1) n += 1;
  }
  return sum(array) / n;
}

function standardDev(array) {
  let average = mean(array);
  array.forEach((cur, i, arr) => {
    if (cur != -1) arr[i] = Math.pow(cur - average, 2);
  });

  return Math.sqrt(sum(array));
}

function getRatingPrediction(matrix, numNeighbours) {
}

async function main() {
  try {
    // let filePath = await rl.question('Enter path to input file: ');
    // let neighbourhoodSize = await rl.question('Enter neighbourhood size: ');

    // let inputFile = await fs.readFile(filePath);

    // let inputFileArray = inputFile.toString().trim().split('\n');
    // inputFileArray.forEach((cur, i, arr) => { arr[i] = cur.trim().split(' '); });

    // let ratingsMatrix = inputFileArray.slice(3);
    // ratingsMatrix.forEach((cur, i, arr) => { arr[i] = cur.map(Number); });

    rl.close();
  }
  catch (e) {
    console.log(e);
    main();
  }
}

main();