const saveToFile = require('../helpers/fileHelper');
const { formatDateTime } = require('../utils/dateUtils');

const apiLogger = (req, res, next) => {
  const date = new Date().toISOString().split('T')[0];
  const filePath = `logs/${date}.log`;

  console.log('API: ', req.originalUrl);

  const requestStart = Date.now();

  const logData = {
    method: req.method,
    url: req.originalUrl,
    request_start_time: formatDateTime(requestStart),
  };

  // Override res.json to print response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const requestEnd = Date.now();
    logData.request_end_time = formatDateTime(requestEnd);
    logData.response_time = `${requestEnd-requestStart} ms`;
    logData.response = JSON.stringify(body);
    
    saveToFile(filePath, logData);
    originalJson(body);
  };


  next();
};

module.exports = apiLogger;
