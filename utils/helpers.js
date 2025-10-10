function getApiName(path) {
    const cleanPath = path.split('?')[0];
    const parts = cleanPath.split('/').filter(Boolean).filter(p => isNaN(p));
    const apiName = parts.join('_');
    console.log('API Name: ', apiName);
    return apiName;
}

function getFieldName(apiName){
    const fields = {
        // Matches
        matches_info: "match_info",
        matches_advance: "match_advance",
        matches_content: "match_content",
        matches_newpoint2: "match_point",
        matches_statistics: "match_statistics",
        matches_wagons: "match_wagons",

        // Matches Innings
        matches_innings_commentary: "innings_commentary",
        matches_innings_content: "innings_content",

        // Teams
        teams_player: "teams_player",
        teams_squads: "teams_squads",
        teams_stats: "teams_stats",

        // Team Tracker
        teams_crickettracker: "crickettracker"
    };
    return fields?.[apiName] || null;
}

function getOffset(pageNumber=1, perPage=20) {
    if(perPage > 80) perPage = 80;
    return (pageNumber - 1) * perPage;
}

module.exports = { getApiName, getFieldName, getOffset };
