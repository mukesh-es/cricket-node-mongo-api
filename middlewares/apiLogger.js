const path = require('path');
const { formatDateTime } = require('../utils/dateUtils');
const { getConfigSync } = require('../helpers/configHelper');
const { createFolder, appendDataToFile } = require('../helpers/fileHelper');

const apiLogger = (req, res, next) => {
  const config = getConfigSync();

  const logsTrue = config.file_log  && config.file_log === true;

  const startTime = Date.now();
  const currentTime = formatDateTime();
  const requestURL = req.originalUrl;
  const queryParams = req.query || {};

  // Folder Path
  const date = new Date().toISOString().split('T')[0];
  if(logsTrue){
    const logDir = path.join(__dirname, '..', 'logs', 'api');
    createFolder(logDir);

    // File Name
    const logFile = path.join(logDir, `${date}.log`);

    // IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    
    // Platform
    let platform = req.headers['x-client-platform'] || 'unknown';
    if (platform === 'unknown') {
      const ua = req.headers['user-agent'] || '';
      if (/android|iphone|ipad|ios/i.test(ua)) {
        platform = 'app';
      } else if (/mozilla|chrome|safari|firefox/i.test(ua)) {
        platform = 'web';
      }
    }

    const logData = [
      currentTime,
      requestURL,
      ip,
      platform,
      queryParams,
    ];
    appendDataToFile(logFile, logData);
  }

  // Override res.json to print response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const durationMs = Date.now() - startTime;
    const durationSec = durationMs / 1000;

    let responseMsg = body.message??'unknown';
    let responseStatus = body.status??'unknown';
    if (typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body);
        responseMsg = parsedBody.message ?? 'unknown';
        responseStatus = parsedBody.status ?? 'unknown';
      } catch {
        responseMsg = body.slice(0, 50);
      }
    }
    
    // Slow Log
    if (durationSec >= 2) {
      const slowLog = {
        currentTime, 
        durationSec, 
        requestURL, 
        queryParams, 
      }
      const slowType = durationSec >= 10 ? 'very-slow-api' : 'slow-api';
      const slowLogDir = path.join(__dirname, '..', 'logs', slowType);
      createFolder(slowLogDir);
      const fileName = `${date}.log`;
      const slowLogFile = path.join(slowLogDir, fileName);
      appendDataToFile(slowLogFile, slowLog);
    }
    // console.log(`[${currentTime}], ${requestURL}, ${responseMsg} (${responseStatus})`);
    originalJson(body);
  };

  
  next();
};

module.exports = apiLogger;
