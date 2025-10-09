function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const parts = cleanPath.split('/').filter(Boolean).filter(p => isNaN(p));
    const apiName = parts.join('_');
    return apiName;
}

function getFieldName(apiName){
    const fields = {
        matches_info: "match_info",
        matches_advance: "match_advance",
        matches_content: "match_content",
        matches_newpoint2: "match_point",
        matches_statistics: "match_statistics",
        matches_wagons: "match_wagons",
        matches_playervsplayer: "match_playervsplayer_tavstb",
    };
    return fields?.[apiName] || null;
}

module.exports = { getApiName, getFieldName };
