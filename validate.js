const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const yaml = require('js-yaml');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

if (!argv.schema || !argv.data) {
  console.error('Usage: node validate.js --schema=<schema_file> --data=<data_directory>');
  process.exit(1);
}

const schemaPath = path.resolve(argv.schema);
const dataDirectoryPath = path.resolve(argv.data);

const schema = yaml.load(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else if (file.endsWith('.yaml')) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const files = getAllFiles(dataDirectoryPath);

files.forEach((filePath) => {
  const data = yaml.load(fs.readFileSync(filePath, 'utf8'));

  const valid = validate(data);
  if (!valid) {
    console.log(`Validation errors in file ${filePath}:`, JSON.stringify(validate.errors, null, 2));
    process.exit(1);
  } else {
    console.log(`File ${filePath} is valid.`);
  }
});
