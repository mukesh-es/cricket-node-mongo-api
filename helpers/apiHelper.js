const axios = require("axios");
const { errorWithTime } = require("./helpers");

async function callAPI({
  url,
  method = "GET",
  data = {},
  headers = {},
  retries = 2,          // automatic retry on failure
  timeout = 5000        // 5 sec timeout
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
        validateStatus: () => true // prevent axios from throwing on 4xx/5xx
      });

      // If API returns unauthorized or server error — handle gracefully
      if ([401, 403].includes(response.status)) {
        errorWithTime("AUTH ERROR", response.status, url);
        return { success: false, error: "unauthorized", status: response.status };
      }

      if (response.status >= 500) {
        throw new Error("Server error " + response.status);
      }

      // Normal success structure
      return {
        success: true,
        status: response.status,
        data: response.data?.response ?? response.data ?? []
      };

    } catch (err) {
      attempt++;

      // Retry only on network or server crash
      if (attempt <= retries) {
        errorWithTime(`Retrying (${attempt}/${retries})`, err.message, url);
        await new Promise(res => setTimeout(res, 500)); // small delay
        continue;
      }

      // All retries failed → return safe response
      errorWithTime("API FINAL ERROR", err.message, url);
      return {
        success: false,
        error: err.message,
        status: null,
        data: []
      };
    }
  }
}

module.exports = callAPI;
