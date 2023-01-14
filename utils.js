const fs = require('fs');

const fileProcessor = {
  viewFile: (partialsUnready, partialsReady) => {
    function readFiles(dirname) {
      let result = [];

      fs.readdirSync(dirname).forEach(fileName => {
        const tempPath = dirname + '/' + fileName;

        const contents = fs.readFileSync(tempPath, 'utf-8');

        result.push({ name: fileName, contents: contents })
      });

      return result;
    }

    const tempFiles = readFiles(partialsUnready),
    allFiles = tempFiles.concat(readFiles(partialsReady));

    allFiles.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    let finalFile = '';

    for (const file of allFiles)
      finalFile += file.contents + '\n\n';

    return finalFile;
  },
  parsingParagraph: (startFile, endCatalog) => {
    const fs = require('fs');

    fs.readFile(startFile, 'utf8', function(err, data) {
      if (data) {
        const path = require('path');

        fs.mkdir(
          path.join(__dirname, endCatalog),
          { recursive: true },
          (err) => {}
        );

        const paragraphText = data.split('\\n'),
        resultArray = [...paragraphText];

        for (let i = 0; i < paragraphText.length; i++) {
          if (paragraphText[i].match(/[!.?]/g).length > 6) {
            resultArray.splice(i, 1);

            const temp = paragraphText[i]
              .replace(/[.]/g, '.&')
              .replace(/[!]/g, '!&')
              .replace(/[?]/g, '?&')
              .split('&');

            let result = '';

            for (let i = 1; i <= temp.length; i++) {
              result += temp[i - 1];

              if (i % 6 === 0 || i === temp.length) {
                resultArray.push(result);
                result = '';
              }
            }
          }
        }

        for (let i = 0; i < resultArray.length; i++) {
          fs.writeFile(
            `${endCatalog}/part${i + 1}.txt`,
            resultArray[i],
            {
              encoding: 'utf8',
              flag: 'w'
            },
            (err) => { if (err) console.log(err); }
          );
        }
      }

      if (err) console.log(err);
    });

    return endCatalog;
  },
  getSortedPartials: partialsFolder => {
    const partials = fs.readdirSync(partialsFolder);

    partials.sort((a, b) => {
      return a.localeCompare(
        b,
        undefined,
        { numeric: true, sensitivity: 'base' }
      );    
    });

    return partials;
  },
  readFile: pathToFile => fs.readFileSync(pathToFile, 'utf-8'),
  completePart: (oldPath, newPath, contents) => {
    fs.write(oldPath, contents, (err) => {
      if (err) console.log(err);
    });

    fs.rename(oldPath, newPath, (err) => {
      console.log(err);
    });
  }
};

module.exports = fileProcessor;
