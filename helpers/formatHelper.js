const { getDateMonth } = require("../utils/dateUtils");

function formatCompetitionInfo(data){
    return {
        cid: data.cid??0,
        title: data.title??'',
        abbr: data.abbr??'',
        type: data.type??'',
        category: data.category??'',
        match_format: data.game_format??'',
        status: data.status??'',
        season: data.season??'',
        datestart: data.datestart??'',
        month: data.datestart ? getDateMonth(data.datestart) : '',
        dateend: data.dateend??'',
        country: data.country??'',
        logo_url: data.logo_url??'',
        total_matches: String(data.total_matches??0),
        total_rounds: String(data.total_rounds??0),
        total_teams: String(data.total_teams??0)
    }
}

module.exports = {formatCompetitionInfo};