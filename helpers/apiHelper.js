const axios = require("axios");
const { errorWithTime } = require("./loggerHelper");

// interceptors axios instance
axios.interceptors.request.use((config) => {
  config._startTime = Date.now();
  return config;
});

axios.interceptors.response.use(
  (response) => {
    response.durationMs = Date.now() - response.config._startTime;
    return response;
  },
  (error) => {
    if (error.config) {
      error.durationMs = Date.now() - error.config._startTime;
    }
    return Promise.reject(error);
  }
);

async function callAPI({
  req,
  url,
  method = "GET",
  data = {},
  headers = {},
  timeout = 15000,
} = {}) {
    try {
      const response = await axios({
        method: (method || "GET").toUpperCase(),
        url,
        headers,
        data,
        timeout,
        validateStatus: () => true // prevents axios from throwing on 401/500
      });

      if (req && response.durationMs != null) {
        req._externalApiTime = (req._externalApiTime || 0) + response.durationMs;
        req._externalApiCalls = (req._externalApiCalls || 0) + 1;
      }

      // If status is 401 or 500 → treat as error
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Keep your exact return behavior
      const responseData = response.data;
      return responseData?.response ?? [];

    } catch (err) {
      errorWithTime("API call error:", err.message, url);
      return null;
    }
}

module.exports = callAPI;
