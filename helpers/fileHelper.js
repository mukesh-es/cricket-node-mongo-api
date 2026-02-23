// const fs = require('fs');
const fs = require("fs").promises;

async function createFolder(folder) {
  await fs.mkdir(folder, { recursive: true });
}

function appendDataToFile(file, data) {
  fs.appendFile(file, JSON.stringify(data) + '\n')
    .catch(() => {});
}

module.exports = {createFolder, appendDataToFile};