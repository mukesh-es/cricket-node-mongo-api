const { formatDateTime } = require('../utils/dateUtils');
const path = require('path');
const fs = require('fs');

const apiLogger = (req, res, next) => {
  const logDir = path.join(__dirname, '..', 'logs', 'api');
  const currentTime = formatDateTime();
  const requestURL = req.originalUrl;

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

  const logData = {
    time: currentTime,
    method: req.method,
    url: requestURL,
    ip,
    platform,
    query: req.query || {},
    body: req.body || {}
  };

  fs.appendFile(
    logFile,
    JSON.stringify(logData) + '\n',
    () => {} // non-blocking
  );


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
