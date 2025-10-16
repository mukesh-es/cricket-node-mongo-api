const { HTTP_CODE } = require("./consants");
const configModel = require('../models/configModel');
const { getConfigSync } = require("./apiConfigHelper");

const requestSuccess = (res, message = "success", data = {}, status = HTTP_CODE.SUCCESS) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      data = [];
    }
  }

  const apiResponse = generateMetadata({
    status: "ok",
    message: message,
    response: data ? data : [],
  });
  return res.status(status).json(apiResponse);
};

const requestFailed = (res, message = "Something went wrong", status = HTTP_CODE.FAILED) => {
  return res.status(status).json({ error: message });
};

const generateMetadata = (content = {}) => {
  if (typeof content !== "object" || content === null) return content;

  const metaData = { ...content };

  if (!metaData.etag) {
    const hex = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    metaData.etag = Array(8).fill(0).map(hex).join("");
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (!metaData.modified) metaData.modified = now;
  if (!metaData.datetime) metaData.datetime = now;
  
  const apiConfig = getConfigSync();
  if (metaData && apiConfig.api_version) {
      metaData.api_version = apiConfig.api_version;
  }

  return metaData;
};


module.exports = { requestSuccess, requestFailed };
