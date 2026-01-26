const axios = require("axios");
const { errorWithTime } = require("./loggerHelper");

async function callAPI({
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
