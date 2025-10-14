const MatchModel = require('../models/matchesModel');
const TeamModel = require('../models/teamModel');
const PlayerModel = require('../models/playerModel');
const { getPagination } = require('./helpers');

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
        const { status, cid, team_id, paged, per_page } = inputs;
        if(status && status > 0){
            if(status == 1){
                orderType = 'ASC';
            }
            filters.status_id = Number(status);
        }
        
        if(cid && cid > 0){
            filters.cid = Number(cid);
        }

        if(team_id && team_id > 0){
            filters.$or = [
                { teama: Number(team_id) },
                { teamb: Number(team_id) }
            ];
        }

        const pagination = getPagination(paged, per_page);
        const result = await MatchModel.find(filters, 'match_info_for_list').sort(orderType).skip(pagination.offset).limit(pagination.limit);
        if(result){
            return result.map(r => JSON.parse(r.match_info_for_list)).flat();
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
            return result.map(r => JSON.parse(r.teams_info_for_list)).flat();
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
            return result.map(r => JSON.parse(r.players_list)).flat();
        }
        return null;
    }catch(err){
        return null;
    }
}

module.exports = { 
    getFieldByAPI, 
    getMatchesList, 
    getTeamsList,
    getPlayersList 
};
