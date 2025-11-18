const axios = require('axios');
const { errorWithTime } = require('./helpers');

async function callAPI({
  url, 
  method = 'GET', 
  data = {}, 
  headers = {}} = {}
) {
  try {
    const options = {
      method: method.toUpperCase(),
      url,
      headers,
    };

    // Only attach data for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
      options.data = data;
    }

    const response = await axios(options);
    const responseData = response.data;
    if(responseData.response){
      return responseData.response;
    }
    return [];
  } catch (error) {
    errorWithTime('API call error:', error.message, url);
    return null;
  }
}

module.exports = callAPI;