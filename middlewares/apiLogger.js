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

    // Slow Log
    const totalMs = Date.now() - startTime;
    const totalSec = totalMs / 1000;

    const externalMs = req._externalApiTime || 0;
    const externalSec = externalMs / 1000;

    const nodeMs = totalMs - externalMs;
    const nodeSec = nodeMs / 1000;

    const externalCalls = req._externalApiCalls || 0;

    const isNodeSlow = nodeSec >= 1; 
    const isExternalSlow = externalSec >= 2;
    const isTotalSlow = totalSec >= 2;

    if (isTotalSlow) {
      const slowLog = {
        currentTime, 
        requestURL, 
        queryParams, 
        timing: {
          totalSec: +totalSec.toFixed(3),
          externalApiSec: +externalSec.toFixed(3),
          nodeProcessingSec: +nodeSec.toFixed(3),
          externalApiCalls: externalCalls,
        },
        flags: {
          isNodeSlow,
          isExternalSlow,
        }
      };

      let slowType;
      if (totalSec >= 10) {
        slowType = 'very-slow-api';
      } else if (isExternalSlow && !isNodeSlow) {
        slowType = 'slow-external-api';
      } else {
        slowType = 'slow-api';
      }

      const slowLogDir = path.join(__dirname, '..', 'logs', slowType);
      createFolder(slowLogDir);
      const fileName = `${date}.log`;
      const slowLogFile = path.join(slowLogDir, fileName);
      appendDataToFile(slowLogFile, slowLog);
    }

    // let responseMsg = body.message??'unknown';
    // let responseStatus = body.status??'unknown';
    // if (typeof body === 'string') {
    //   try {
    //     const parsedBody = JSON.parse(body);
    //     responseMsg = parsedBody.message ?? 'unknown';
    //     responseStatus = parsedBody.status ?? 'unknown';
    //   } catch {
    //     responseMsg = body.slice(0, 50);
    //   }
    // }
    // console.log(`[${currentTime}], ${requestURL}, ${responseMsg} (${responseStatus})`);
    
    originalJson(body);
  };

  
  next();
};

module.exports = apiLogger;
