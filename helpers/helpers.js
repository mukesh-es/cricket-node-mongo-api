const { apiFieldsKeys } = require("../config/apiFieldKeys");

function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const pathSegments = cleanPath.split('/').filter(Boolean);
    const parts = pathSegments.filter(p => isNaN(p));
    const segmentsCount = pathSegments.length;
    let suffix = '';
    if(segmentsCount == 2 && !isNaN(pathSegments[1])){
        suffix = '_info';
    }else if(segmentsCount > 2  && pathSegments[2] === 'stats'){
        return `${pathSegments[0]}_stats`;
    }
    const apiName = `${parts.join('_')}${suffix}` || 'root';
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

module.exports = { getApiName, getFieldName, getPagination };
