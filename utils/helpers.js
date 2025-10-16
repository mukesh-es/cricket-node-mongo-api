const { apiFieldsKeys } = require("./apiFieldKeys");

function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const parts = cleanPath.split('/').filter(Boolean).filter(p => isNaN(p));
    const apiName = parts.join('_') || 'root';
    return apiName;
}

function getFieldName(apiName){
    return apiFieldsKeys?.[apiName] || null;
}

function getPagination(pageNumber=1, perPage=20) {
    if(!pageNumber){
        pageNumber=1
    }
    if(!perPage){
        perPage=20
    }
    if(perPage > 80) perPage = 80;
    return {
        offset: (pageNumber - 1) * perPage,
        limit: perPage
    } 
}

function getApiCacheKey(path) {
  // Remove query string
  const cleanPath = path.split('?')[0];

  // Split by `/`, remove empty parts and numbers (IDs)
  const parts = cleanPath.split('/').filter(Boolean).filter(p => isNaN(p));

  // Join with `_` to make a valid key
  const apiName = parts.join('_') || 'root';

  return `cache:${apiName}`;
}

module.exports = { getApiName, getFieldName, getPagination, getApiCacheKey };
