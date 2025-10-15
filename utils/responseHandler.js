const { HTTP_CODE } = require("./consants");

const requestSuccess = (res, message = "Success", data = {}, status = HTTP_CODE.SUCCESS) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      data = [];
    }
  }
  
  const apiResponse = generateMetadata({
    status: "ok",
    response: data ? data : [],
  });
  return res.status(status).json(apiResponse);
};

const requestFailed = (res, message = "Something went wrong", status = HTTP_CODE.FAILED) => {
  return res.status(status).json({ error: message });
};

const generateMetadata = (content = {}) => {
  if (typeof content !== "object" || content === null) return content;

  const result = { ...content };

  if (!result.etag) {
    const hex = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    result.etag = Array(8).fill(0).map(hex).join("");
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (!result.modified) result.modified = now;
  if (!result.datetime) result.datetime = now;
  if (!result.api_version) result.api_version = "5.0.12";

  return result;
};


module.exports = { requestSuccess, requestFailed };
