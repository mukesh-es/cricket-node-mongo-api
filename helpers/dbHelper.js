const MatchModel = require('../models/matchesModel');
const TeamModel = require('../models/teamModel');
const PlayerModel = require('../models/playerModel');
const CompetitionModel = require('../models/competitionModel');

const { getTimestampRange } = require('../utils/dateUtils');
const { getPagination } = require('./helpers');
const { formatCompetitionInfo } = require('./formatHelper');

let cachedConfig = null;

const getConfig = async () => {
  if (!cachedConfig) {
     try {
        cachedConfig = await configModel.findOne();
    } catch (err) {
        console.error("Failed to load config:", err);
    }
  }
  return cachedConfig;
};

async function getFieldByAPI(Model, apiName, filters={}) {
    try{
        const doc = await Model.findOne(filters).lean();
        if(!doc) return null;
        return doc[apiName] || null;
    }catch(err){
        console.error('Error: ', err.message);
        return null;
    }
}

async function getMatchesList(inputs) {
    try{
        let filters = {};
        let orderType = 'DESC';
        const { status, cid, team_id, venue_id, date, paged, per_page } = inputs;
        if(status && status > 0){
            if(status == 1){
                orderType = 'ASC';
            }
            filters.status_id = Number(status);
        }
        
        if(cid && cid > 0){
            filters.cid = Number(cid);
        }

        if(date){
            const dateArray = date.split('_');
            if(dateArray.length > 1){
                const [startDate, endDate] = dateArray;
                const startRange = getTimestampRange(startDate);
                const endRange = getTimestampRange(endDate);
                filters.timestamp_start = {
                    $gte: startRange.start,
                    $lte: endRange.end,
                }
            }else{
                const range = getTimestampRange(date);
                filters.timestamp_start = {
                    $gte: range.start,
                    $lte: range.end,
                }
            }
        }

        if(team_id && team_id > 0){
            filters.$or = [
                { teama: Number(team_id) },
                { teamb: Number(team_id) }
            ];
        }

        if(venue_id && venue_id > 0){
            filters.venue_id = Number(venue_id);
        }
        const pagination = getPagination(paged, per_page);
        const result = await MatchModel.find(filters, 'match_info_for_list').sort(orderType).skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.match_info_for_list)).flat();
            return itemsResponse(items);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getTeamsList(inputs) {
    try{
        let filters = {};
        const {search, paged, per_page} = inputs;

        if(search){
            filters.title = { $regex: search, $options: "i" } 
        }

        const pagination = getPagination(paged, per_page);
        const result = await TeamModel.find(filters, 'teams_info_for_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.teams_info_for_list)).flat();
            return itemsResponse(items);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getPlayersList(inputs) {
    try{
        let filters = {};
        const {search, paged, per_page} = inputs;

        if(search){
            filters.title = { $regex: search, $options: "i" } 
        }

        const pagination = getPagination(paged, per_page);
        const result = await PlayerModel.find(filters, 'players_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.players_list)).flat();
            return itemsResponse(items);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getCompetitionsList(inputs) {
    try{
        let filters = {};
        const {season, paged, per_page} = inputs;

        if(season){
            filters.season = String(season);
        }
        const pagination = getPagination(paged, per_page);
        const result = await CompetitionModel.find(filters, 'competitions_info').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => formatCompetitionInfo(JSON.parse(r.competitions_info))).flat();
            return itemsResponse(items);
        }
        return null;
    }catch(err){
        return null;
    }
}

function itemsResponse(items){
    return {
        items: items,
        total_items: String(items.length),
        total_pages: 1
    }
}

module.exports = { 
    getFieldByAPI, 
    getMatchesList, 
    getTeamsList,
    getPlayersList,
    getCompetitionsList
};
