const { formatDateTime } = require('../utils/dateUtils');
const path = require('path');
const fs = require('fs');
const { getConfigSync } = require('../helpers/configHelper');

const apiLogger = (req, res, next) => {
  const config = getConfigSync();
  const currentTime = formatDateTime();
  const requestURL = req.originalUrl;

  if(config.file_log  && config.file_log === true){
      const logDir = path.join(__dirname, '..', 'logs', 'api');

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(logDir, `${date}.log`);

      const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown';
      
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
        req.query || {},
      ];

      fs.appendFile(
        logFile,
        JSON.stringify(logData) + '\n',
        () => {} // non-blocking
      );
  }


  // Override res.json to print response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
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

    // console.log(`[${currentTime}], ${requestURL}, ${responseMsg} (${responseStatus})`);
    originalJson(body);
  };
  next();
};

module.exports = apiLogger;
