const fs = require('fs');
const path = require('path');
const { formatDateTime } = require('../utils/dateUtils');

function saveToFile(relativePath, data) {
  const fullPath = path.join(__dirname, '..', relativePath);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Prepare data
  const timestamp = formatDateTime();
  const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
  const finalData = `${timestamp}: ${content}\n`;

  // Append to file
  fs.appendFileSync(fullPath, finalData, 'utf8');
}

module.exports = saveToFile;