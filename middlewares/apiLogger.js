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
      console.log('body: ', body.slice(0, 50));
      try {
        const parsedBody = JSON.parse(body);
        responseMsg = parsedBody.message ?? 'unknown';
        responseStatus = parsedBody.status ?? 'unknown';
      } catch {
        responseMsg = body.slice(0, 50);
      }
    }

    console.log(`[${currentTime}], ${requestURL}, ${responseMsg} (${responseStatus})`);
    originalJson(body);
  };
  next();
};

module.exports = apiLogger;



// const saveToFile = require('../helpers/fileHelper');
// const { formatDateTime } = require('../utils/dateUtils');

// const apiLogger = (req, res, next) => {
//   const date = new Date().toISOString().split('T')[0];
//   const filePath = `logs/${date}.log`;

//   const currentTime = formatDateTime();
//   const requestURL = req.originalUrl;

//   const requestStart = Date.now();

//   const logData = {
//     method: req.method,
//     url: req.originalUrl,
//     request_start_time: formatDateTime(requestStart),
//   };

//   // Override res.json to print response
//   const originalJson = res.json.bind(res);
//   res.json = (body) => {
//     const requestEnd = Date.now();
//     logData.request_end_time = formatDateTime(requestEnd);
//     logData.response_time = `${requestEnd-requestStart} ms`;
//     // logData.response = JSON.stringify(body);
//     logData.response = `${body.status}, ${body.message}`;

//     console.log(`[${currentTime}], ${requestURL}, ${body.message} (${body.status})`);
    
//     saveToFile(filePath, logData);
//     originalJson(body);
//   };


//   next();
// };

// module.exports = apiLogger;
