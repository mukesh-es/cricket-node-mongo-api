const fs = require('fs');

function createFolder(folder){
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

function appendDataToFile(file, data){
  fs.appendFile(
    file,
    JSON.stringify(data) + '\n',
    () => {}
  );
}

module.exports = {createFolder, appendDataToFile};