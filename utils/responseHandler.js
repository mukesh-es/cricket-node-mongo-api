const { HTTP_CODE } = require("../config/constants");
const { getConfigSync } = require("../helpers/configHelper");

const requestSuccess = ({res, message = "success", result = {}, status = HTTP_CODE.SUCCESS}) => {
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch (err) {
      result = [];
    }
  }

  const apiResponse = generateMetadata({
    status: "ok",
    response: result ? result : [],
    message: message,
  });
  return sendResponse(res, status, apiResponse);
};

const requestFailed = ({res, message = "Something went wrong", status = HTTP_CODE.FAILED, err}) => {
  const apiResponse = generateMetadata({
    status: "error",
    message: `${message}${err ? ` : ${err}` : ''}`,
  });
  return sendResponse(res, status, apiResponse);
};

const sendResponse = (res, status, apiResponse) => {
  return res.status(status).json(apiResponse);
}

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
