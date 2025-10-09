const { HTTP_CODE } = require("./consants");

const requestSuccess = (res, message = "Success", data = {}, status = HTTP_CODE.SUCCESS) => {
  const response = {
     status: "ok",
     response: data ? data : []
  }
  return res.status(status).json(response);
};

const requestFailed = (res, message = "Something went wrong", status = HTTP_CODE.FAILED) => {
  return res.status(status).json({ error: message });
};

module.exports = { requestSuccess, requestFailed };
