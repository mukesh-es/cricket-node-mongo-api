const MatchModel = require('../models/matchesModel');
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
        const { status, cid, team_id } = inputs;
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

        const pagination = getPagination(inputs.paged, inputs.per_page);
        const result = await MatchModel.find(filters, 'match_info_for_list').sort(orderType).skip(pagination.offset).limit(pagination.limit);
        if(result){
            return result.map(r => r.match_info_for_list).flat();
        }
        return null;
    }catch(err){
        return null;
    }
}

module.exports = { getFieldByAPI, getMatchesList };
