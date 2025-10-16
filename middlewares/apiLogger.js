// middlewares/apiLogger.js
const apiLogger = (req, res, next) => {

  // Print request info
  console.log(`\n[API REQUEST] ${req.method} ${req.originalUrl}`);

  // Override res.json to print response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    console.log(`[API RESPONSE] ${req.method} ${req.originalUrl}`);
    console.log(JSON.stringify(body, null, 2)); // pretty print
    originalJson(body); // send response to client
  };

  next(); // continue to next middleware/controller
};

module.exports = apiLogger;
