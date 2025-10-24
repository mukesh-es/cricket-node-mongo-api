const MatchModel = require('../models/matchesModel');
const TeamModel = require('../models/teamModel');
const PlayerModel = require('../models/playerModel');
const CompetitionModel = require('../models/competitionModel');
const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');

const { getTimestampRange, getUnixTimestamp, toIST } = require('../utils/dateUtils');
const { getPagination, getPages } = require('./helpers');
const { formatCompetitionInfo, formatReelInfo, formatNewsInfo } = require('./formatHelper');
const { NEWS_CATEGORIES, NEWS_APP_CATEGORIES } = require('../config/consants');


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
        let { status, cid, team_id, venue_id, date, type, order, paged, per_page } = inputs;
        const orderStatus = order && order!= '';
        if(status && status > 0){
            if(status == 1 && !orderStatus){
                order = 'asc';
            }
            filters.status_id = Number(status);
        }
        
        if(cid && cid > 0){
            filters.cid = Number(cid);
        }
        if(type && type != '') {
            if(!orderStatus){
                order = 'asc';
            }
            filters.status_id = {$in: [3, 1]};
		}
        if(!orderStatus){
            order = 'asc';
        }

        const sortingOrder = order == 'desc' ? -1 : 1;

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

        // Total Items
        const totalCount = await MatchModel.countDocuments(filters);

        // Paginated Items
        const result = await MatchModel.find(filters, 'match_info_for_list').sort({timestamp_start: sortingOrder}).skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.match_info_for_list)).flat();
            return itemsResponse(items, totalCount, pagination.limit);
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
        
        // Total Items
        const totalCount = await TeamModel.countDocuments(filters);

        // Paginated Items
        const result = await TeamModel.find(filters, 'teams_info_for_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.teams_info_for_list)).flat();
            return itemsResponse(items, String(totalCount), pagination.limit);
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

        // Total Items
        const totalCount = await PlayerModel.countDocuments(filters);

        // Paginated Items
        const result = await PlayerModel.find(filters, 'players_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.players_list)).flat();
            return itemsResponse(items, String(totalCount), pagination.limit);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getCompetitionsList(inputs) {
    try{
        let filters = {};
        const {season, country, paged, per_page} = inputs;

        if(season){
            filters.season = String(season);
        }
        if(country){
            filters.country = country;
        }
        const pagination = getPagination(paged, per_page);

        // Total Items
        const totalCount = await CompetitionModel.countDocuments(filters);

        // Paginated Items
        const result = await CompetitionModel.find(filters, 'competitions_info').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => formatCompetitionInfo(JSON.parse(r.competitions_info))).flat();
            return itemsResponse(items, String(totalCount), pagination.limit);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getReelsList(inputs) {
    try {
        const currentTime = toIST(getUnixTimestamp());
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

        const countries = ['all'];
        if(country && country != ''){
            countries.push(country.toLowerCase());
        }

        const postTypeCode = 9;

        const filters = {};

        if (filter_type && filter_type > 0 && filter_value) {
            if(filter_type === 1){
                const matchesResult = await MatchModel.find({ cid: filter_value }, 'match_id');
                const compMatchesIds = matchesResult.map(m => Number(m.match_id));
                compMatchesIds.push(filter_value);

                filters.connectfrom = {$in: [1, 3] };
                filters.connectId = {$in: compMatchesIds};
            }else{
                filters.connectfrom = filter_type;
                filters.connectId = filter_value;
            }
        }

        if(type != 'all' ){
		    filters.connectfrom = { $ne: postTypeCode };
		}

        filters.$or = [
            { scheduled: { $gt: 0, $lte: currentTime } },
            { scheduled: 0 }
        ];

        // country IN ('all')
        filters.country = { $in: countries };

        // media_platform <= 0 if latest_version
        if (latest_version) {
            filters.media_platform = { $lte: 0 };
        }

        if (news_cat) {
            filters.news_cat = Number(news_cat);
        }

        const pagination = getPagination(paged, per_page || 60);
        // Total Items
        const totalCount = await ReelModel.countDocuments(filters);

        // Paginated Items
        const result = await ReelModel.find(filters)
        .sort({ orderby_time: -1 })
        .skip(pagination.offset)
        .limit(pagination.limit);

        if (result) {
            const items = result.map(r => formatReelInfo(r));
            return itemsResponse(items, totalCount, pagination.limit);
        } 
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
        category = category > 0 ? Number(category) : 0;

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

        // Total Items
        const totalCount = await NewsModel.countDocuments(filters);

        // Paginated Items
        const result = await NewsModel.find(filters).sort({ created: -1 }).skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => formatNewsInfo(r));
            const response = itemsResponse(items, totalCount, pagination.limit);
            response.categories = NEWS_CATEGORIES;
            response.news_app_cat = NEWS_APP_CATEGORIES;
            return response;
        }
        return null;
    }catch(err){
        return null;
    }
}

function itemsResponse(items, totalCount, limit){
    return {
        items,
        total_items: totalCount,
        total_pages: getPages(totalCount, limit)
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
