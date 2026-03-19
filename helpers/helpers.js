const { apiFieldsKeys } = require("../config/apiFieldKeys");
const { CRICKET_FORMATS, PERPAGE_LIMITS } = require("../config/constants");
const { getContextValue } = require("../middlewares/requestContext");
const { getConfigSync } = require("./configHelper");

function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const pathSegments = cleanPath.split('/').filter(Boolean);
    const parts = pathSegments.filter(p => isNaN(p));
    const segmentsCount = pathSegments.length;
    let apiName = '';
    let suffix = '';
    if(segmentsCount == 2 && !isNaN(pathSegments[1])){
        suffix = '_info';
    }else if(segmentsCount > 2  && pathSegments[2] === 'stats'){
        apiName = `${pathSegments[0]}_stats`;
    }
    if(apiName == ''){
        apiName = `${parts.join('_')}${suffix}` || 'root';
    }
    return apiName;
}

function getFieldName(apiName){
    return apiFieldsKeys?.[apiName] || null;
}

function getMin(v1, v2) {
    return Math.min(Number(v1), Number(v2));
}

function getOffset(pageNumber, perPage){
  return (pageNumber - 1) * perPage;
}

function getLimit(perPage = null) {
  const apiName = getContextValue('api_name');
  const limits = PERPAGE_LIMITS[apiName] ?? PERPAGE_LIMITS.default;

  return !isValidNumber(perPage)
      ? limits.default
      : getMin(perPage, limits.max);
}

function getPagination(pageNumber = 1, perPage = null) {
    pageNumber = Number(pageNumber) || 1;

    const limit = getLimit(perPage);
    
    return {
        offset: getOffset(pageNumber, limit),
        limit: limit
    };
}

function getPages(totalCount, limit){
    return Math.ceil(totalCount / limit)
}

function getApiURL({ path, base = 'appapi', routePrefix = '' }) {
  if (!path) {
    throw new Error('path is required');
  }

  // path = path.replace(/^\/+/, '');
  path = path.replace(/^\/+/, '').replace(/\/+$/, '');

  const baseObjEnv = {
    rest: process.env.REST_BASE,
    appapi: process.env.APPAPI_BASE,
    admanager: process.env.AD_MANAGER
  };

  const apiConfig = getConfigSync();
  const configBases = apiConfig?.api_base_urls ?? {};

  const allBases = {
    ...configBases,
    ...baseObjEnv
  };

  if (!(base in allBases) || !allBases[base]) {
    throw new Error(`Invalid or missing API base: ${base}`);
  }

  let apiURL = allBases[base];

  if (routePrefix) {
    apiURL += `${routePrefix}/`;
  }

  // ---- SAFE query handling ----
  if (apiConfig?.token && path.includes('?')) {
    const [pathname, queryString] = path.split('?');
    const params = new URLSearchParams(queryString);

    if (params.has('token')) {
      params.set('token', apiConfig.token);
      path = `${pathname}?${params.toString()}`;
    }
  }

  apiURL += path;
  return apiURL;
}

function getValidCountry(country='in'){
    if(country != 'bd' && country != 'pk'){
        country = 'in';
    }
    return country;
}
function isValidId(id){
    return id !== undefined && id !== null && id !== '';
}

function replacePathSegment(url, oldSegment, newSegment) {
  if (!url || !oldSegment) return url;

  const [path, query] = url.split('?');

  const updatedPath = path
    .split('/')
    .map(segment => segment === oldSegment ? newSegment : segment)
    .join('/');

  return query ? `${updatedPath}?${query}` : updatedPath;
}

function removeQueryParam(url, paramToRemove) {
  if (!url || !paramToRemove) return url;

  const [path, query] = url.split('?');
  if (!query) return url;

  const params = new URLSearchParams(query);
  params.delete(paramToRemove);

  const newQuery = params.toString();
  return newQuery ? `${path}?${newQuery}` : path;
}

const cricketFormatsReverse = Object.fromEntries(
  Object.entries(CRICKET_FORMATS).map(([k, v]) => [v.toLowerCase(), Number(k)])
);

const getFormatName = (value) => {
  if (!Number.isInteger(Number(value))) return null;

  const format = CRICKET_FORMATS[Number(value)];
  return format
    ? format.replace(/\s+/g, "").toLowerCase()
    : null;
};

const getFormatCode = (value) => {
  if (typeof value !== "string") return null;

  return cricketFormatsReverse[value.toLowerCase()] ?? null;
};

const isNumeric = (value) => {
  return (
    (typeof value === "number" && !Number.isNaN(value)) ||
    (typeof value === "string" && /^[0-9]+$/.test(value))
  );
};

const normalizeURL = (url = '') => {
  if (typeof url !== 'string') return url;

  // replace multiple slashes with single slash
  return url.replace(/\/{2,}/g, '/');
};

function normalizeSpaces(input) {
  // If input is a string
  if (typeof input === 'string') {
    return normalizeStr(input);
  }

  // If input is an array
  if (Array.isArray(input)) {
    return input.map(item =>
      typeof item === 'string'
        ? normalizeStr(item)
        : item
    );
  }

  // Return as-is for other types
  return input;
}

const normalizeStr = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

function getPagesCount(total, perPage){
  return Math.ceil(total / perPage);
}


const isValidNumber = (v) => !isEmpty(v) && !isNaN(Number(v));

const isEmpty = (v) =>
    v == null  // null, undefined
    || v === false 
    || Number(v) === 0 
    || (typeof v === 'string' && !v.trim()) // empty string
    || (Array.isArray(v) && !v.length) // []
    || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) // {}
    || (typeof v === 'number' && isNaN(v)); // NaN

module.exports = { 
    getApiName, 
    getFieldName, 
    getPagination,
    getOffset, 
    getPages, 
    getApiURL,
    getValidCountry,
    isValidId,
    replacePathSegment,
    removeQueryParam,
    getFormatName,
    getFormatCode,
    isNumeric,
    normalizeURL,
    normalizeStr,
    normalizeSpaces,
    getPagesCount,
    isEmpty,
    isValidNumber
};
