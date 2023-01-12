const fs = require('fs');

const fileProcessor = {
  viewFile: (partialsNotReady, partialsReady) => {
    function readFiles(dirname) {
      let result = [];
      fs.readdirSync(dirname).forEach(fileName => {
      const contents = fs.readFileSync(dirname+fileName, 'utf-8');
      result.push({ name: fileName, contents: contents})
      })
      return result;
    }
    let allFiles = readFiles(partialsNotReady).concat(readFiles(partialsReady));
    allFiles.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    })
    let finalFile = '';
    for (let file of allFiles) {
      finalFile += file.contents+'\n\n';
    }
    return finalFile;
  }
}

console.log(fileProcessor.viewFile('./data/aboba1partInitial/', './data/aboba1partReady/'))

module.exports = fileProcessor;


