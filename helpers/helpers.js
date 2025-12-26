const { apiFieldsKeys } = require("../config/apiFieldKeys");
const { DEFAULT_PERPAGE_LIMITS } = require("../config/constants");
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

function getPagination(pageNumber = 1, perPage = 20) {
    const apiName = getContextValue('api_name');
    pageNumber = Number(pageNumber) || 1;
    const defaultLimit = DEFAULT_PERPAGE_LIMITS[apiName] || DEFAULT_PERPAGE_LIMITS.default;
    perPage = Math.min(perPage, defaultLimit);

    return {
        offset: (pageNumber - 1) * perPage,
        limit: perPage
    };
}

function getPages(totalCount, limit){
    return Math.ceil(totalCount / limit)
}

function getApiURL({ path, base = 'appapi', routePrefix = '' }) {
    if (!path) {
        throw new Error('path is required');
    }
    path = path.replace(/^\/+/, '');
    const baseObjEnv = {
        rest: process.env.REST_BASE,
        appapi: process.env.APPAPI_BASE
    };
    const apiConfig = getConfigSync();
    const configBases = apiConfig?.api_base_urls ?? {};

    // env has priority
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
    apiURL += `${path}`;
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

module.exports = { 
    getApiName, 
    getFieldName, 
    getPagination, 
    getPages, 
    getApiURL,
    getValidCountry,
    isValidId,
};
