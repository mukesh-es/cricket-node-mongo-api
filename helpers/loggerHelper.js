

const { formatDateTime } = require("../utils/dateUtils");

function logWithTime(...messages) {
  const timestamp = formatDateTime();
  console.log(`[${timestamp}]`, ...messages);
}

function errorWithTime(...messages) {
  const timestamp = formatDateTime();
  console.error(`[${timestamp}]`, ...messages);
}

module.exports = { 
    logWithTime,
    errorWithTime
};