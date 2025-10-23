const { apiFieldsKeys } = require("../config/apiFieldKeys");

function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const pathArray = cleanPath.split('/').filter(Boolean);
    const parts = pathArray.filter(p => isNaN(p));
    let suffix = '';
    if(pathArray.length == 2 && !isNaN(pathArray[1])){
        suffix = '_info';
    }
    const apiName = `${parts.join('_')}${suffix}` || 'root';
    // console.log('apiName: ', apiName);
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
