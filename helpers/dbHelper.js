const MatchModel = require('../models/matchesModel');
const TeamModel = require('../models/teamModel');
const PlayerModel = require('../models/playerModel');
const CompetitionModel = require('../models/competitionModel');
const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');

const { getTimestampRange } = require('../utils/dateUtils');
const { getPagination } = require('./helpers');
const { formatCompetitionInfo } = require('./formatHelper');

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

async function getReelsList(inputs) {
    try {
        const currentTime = Math.floor(Date.now() / 1000) + 5*60*60 + 30*60; // seconds
        let {
            filter_type,
            filter_value,
            news_cat,
            type,
            country,
            latest_version,
            paged,
            per_page
        } = inputs;

        filter_type = Number(filter_type);
        filter_value = Number(filter_value);
        const postTypeCode = 9;

        let compMatchesIds = [];
        if (filter_type === 1 && filter_value) {
            const matchesResult = await MatchModel.find({ cid: filter_value }, 'match_id');
            compMatchesIds = matchesResult.map(m => m.match_id);
            compMatchesIds.push(filter_value);
        }

        const filters = [];

        // Hardcoded connectfrom IN ('1', '3')
        filters.push({ connectfrom: { $in: ['1', '3'] } });

        // Hardcoded connectId IN ('91011', '91012', ..., '91041', '129650')
        filters.push({
        connectId: {
            $in: compMatchesIds
        }
        });

        // connectfrom != '9'
        filters.push({ connectfrom: { $ne: postTypeCode } });

        filters.push({
        $or: [
            { scheduled: { $gt: 0, $lte: currentTime } },
            { scheduled: 0 }
        ]
        });

        // country IN ('all')
        filters.push({ country: { $in: ['all'] } });

        // media_platform <= 0 if latest_version
        if (latest_version) {
            filters.push({ media_platform: { $lte: 0 } });
        }

        // news_cat filter if exists
        if (news_cat) {
            filters.push({ news_cat: Number(news_cat) });
        }

        // Final query
        const query = filters.length > 0 ? { $and: filters } : {};

        // Pagination (hardcoded to match LIMIT 0, 60, but respecting getPagination)
        const pagination = getPagination(paged || 1, per_page || 60);

        console.log('filters: ', filters);

        const result = await ReelModel.find(query)
        .sort({ orderby_time: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit);

        if (result) return itemsResponse(result);
        return null;

    } catch (err) {
        console.error('Error in getReelsList:', err);
        return null;
    }
}

async function getNewsList(inputs) {
    try{
        let filters = {};

        let {
            id,
            country, 
            category,
            news_cat,
            per_page, 
            paged
        } = inputs;
        
        id = id > 0 ? Number(id) : 0;

        const countries = ['all'];
        if(country && country != ''){
            countries.push(country.toLowerCase());
        }
        
        if(news_cat){
            filters.news_cat = Number(news_cat);
        }

        if(id && id > 0){
            filters.news_id = id;
        }
        if(category){
            filters.category = category;
        }
        filters.country = { $in: countries};
       
        const pagination = getPagination(paged, per_page);
        const result = await NewsModel.find(filters).sort({ created: -1 }).skip(pagination.offset).limit(pagination.limit);
        if(result){
            return itemsResponse(result);
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
    getCompetitionsList,
    getReelsList,
    getNewsList
};
