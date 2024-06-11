const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


function aggregate(source, destination) {

  const inputDir = path.join(__dirname, source);
  const outputFile = path.join(__dirname, destination);
  let resultArray = [];
  
  function readYAMLFilesRecursively(dir) {
    const files = fs.readdirSync(dir);
  
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
  
      if (stat.isDirectory()) {
        readYAMLFilesRecursively(fullPath);
      } else if (stat.isFile() && file.endsWith('.yaml')) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const objectData = yaml.load(fileContent);
        resultArray.push(objectData);
      }
    });
  }
  
  readYAMLFilesRecursively(inputDir);
  
  const aggregatedYAML = yaml.dump({ list: resultArray });
  
  fs.writeFileSync(outputFile, aggregatedYAML, 'utf8');
  
  console.log(`Aggregated YAML file created at ${outputFile}`);
}

aggregate('data/jobs',  'data_compiled/all_positions.yaml')
aggregate('data/qualifications',  'data_compiled/all_qualifications.yaml')