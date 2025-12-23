const axios = require("axios");
const { errorWithTime } = require("./loggerHelper");

async function callAPI({
  url,
  method = "GET",
  data = {},
  headers = {},
  retries = 2,
  timeout = 7000,
} = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await axios({
        method: method.toUpperCase(),
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
      attempt++;

      // Retry only if attempts left
      if (attempt <= retries) {
        errorWithTime(`Retry ${attempt}/${retries}`, err.message, url);
        await new Promise(res => setTimeout(res, 300));
        continue;
      }

      // Final failure → return null (YOUR original way)
      errorWithTime("API call error:", err.message, url);
      return null;
    }
  }
}

module.exports = callAPI;
