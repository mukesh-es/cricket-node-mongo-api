const { formatDateTime } = require('../utils/dateUtils');

const apiLogger = (req, res, next) => {
  const currentTime = formatDateTime();
  const requestURL = req.originalUrl;

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
