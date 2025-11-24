const MatchModel = require('../models/matchesModel');
const TeamModel = require('../models/teamModel');
const PlayerModel = require('../models/playerModel');
const CompetitionModel = require('../models/competitionModel');
const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');

const { getTimestampRange, getUnixTimestamp, toIST } = require('../utils/dateUtils');
const { getPagination, getPages, getValidCountry, errorWithTime } = require('./helpers');
const { formatCompetitionInfo, formatReelInfo, formatNewsInfo } = require('./formatHelper');
const { NEWS_CATEGORIES, NEWS_APP_CATEGORIES } = require('../config/constants');
const { getTokenFeatures } = require('./cacheHelper');
const { getContextValue } = require('../middlewares/requestContext');


async function getFieldByAPI(Model, apiName, filters={}) {
    try{
        const doc = await Model.findOne(filters).lean();
        if(!doc) return null;
        return doc[apiName] || null;
    }catch(err){
        errorWithTime('Error: ', err.message);
        return null;
    }
}

async function getMatchesList(inputs) {
    try{
        let filters = {};
        let { 
            status, 
            cid, 
            team_id, 
            venue_id, 
            date,
            format,
            type, 
            order, 
            paged, 
            per_page,
        } = inputs;

        const apiName = getContextValue('api_name');

        if(!order || order == ''){
            order = 'desc';
        }
        
        const allowedCompetitions = await getTokenFeatures('competition');
        if (!allowedCompetitions || allowedCompetitions.length === 0) {
            throw new Error("No competition allowed.");
        }
        if(cid && cid > 0){
            if (!allowedCompetitions.includes(Number(cid))) {
                throw new Error("You don't have a subscription for this competition.");
            }
            filters.cid = Number(cid);
        }else{
            filters.cid = {$in: allowedCompetitions};
        }

        if(status && status > 0){
            if(status == 1){
                order = 'asc';
            }
            if(status == 2){
                filters.status_id = {$in: [2, 4]};
            }else{
                filters.status_id = Number(status);
            }
        }
        
        if(format && format > 0){
            filters.format = Number(format);
        }
        if(type && type != '') {
            order = 'asc';
            filters.status_id = {$in: [3, 1]};
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

        const sortingOrder = order == 'desc' ? -1 : 1;
        const sortBy = { timestamp_start: sortingOrder, match_number: 1 }

        let items = [];
        let totalItems = 0;
        let limit = 0;
        if(apiName === 'venues_matches'){
            const pagination = getPagination(paged, per_page, 'competitions');
            limit = pagination.limit;
            // Total Items
            const competitionIds = await MatchModel.distinct("cid", filters);
            totalItems = competitionIds.length;
            if(totalItems > 0){
                const result = await CompetitionModel.find({cid: {$in: competitionIds}}, 'cid competitions_info').sort({datestart: -1}).skip(pagination.offset).limit(limit);
                if(result){
                    const allItems = await Promise.all(
                        result.map(async (r) => {
                            try {
                                const compInfo = formatCompetitionInfo(r);

                                const matchFilters = { ...filters, cid: r.cid };
                                const compMatches = await MatchModel.find(matchFilters, 'match_info_for_list')
                                    .sort(sortBy).lean();
                                const matches = compMatches
                                                .map((cm) => {
                                                    try {
                                                        return JSON.parse(cm.match_info_for_list);
                                                    } catch (parseErr) {
                                                        console.warn(`Failed to parse match_info_for_list for match ID: ${cm.mid}`, parseErr);
                                                        return null; // Skip bad entries
                                                    }
                                                })
                                                .filter(Boolean);
                                return matches.length > 0
                                        ? [{ ...compInfo, matches }]
                                        : [];
                            } catch (err) {
                                errorWithTime('Error processing competition', r.cid, err);
                                return [];
                            }
                        })
                    );
                    items = allItems.flat();
                }
            }
        }else{
            const pagination = getPagination(paged, per_page);
            limit = pagination.limit;
            // Total Items
            totalItems = await MatchModel.countDocuments(filters);

            // Paginated Items
            if(totalItems > 0){
                const result = await MatchModel.find(filters, 'match_info_for_list').sort(sortBy).skip(pagination.offset).limit(limit).lean();;
                if(result){
                    items = result.map(r => JSON.parse(r.match_info_for_list)).flat();
                }
            }
        }
        return itemsResponse(items, String(totalItems), limit);
    }catch(err){
        throw err;
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
        const totalItems = await TeamModel.countDocuments(filters);

        // Paginated Items
        const result = await TeamModel.find(filters, 'teams_info_for_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.teams_info_for_list)).flat();
            return itemsResponse(items, String(totalItems), pagination.limit);
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
        const totalItems = await PlayerModel.countDocuments(filters);

        // Paginated Items
        const result = await PlayerModel.find(filters, 'players_list').skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result.map(r => JSON.parse(r.players_list)).flat();
            return itemsResponse(items, String(totalItems), pagination.limit);
        }
        return null;
    }catch(err){
        return null;
    }
}

async function getCompetitionsList(inputs) {
    try{
        let filters = {};
        const {season, country, paged, per_page, total_items_type} = inputs;
        const apiName = getContextValue('api_name');

        // Allowed Seasons
        if(season){
            const allowedSeasons = await getTokenFeatures('season');
            if (!allowedSeasons || allowedSeasons.length === 0) {
                throw new Error("No season allowed.");
            }
            if (!allowedSeasons.includes(String(season))) {
                throw new Error(`Season ${season} is not allowed.`);
            }
        }

        // Allowed Competitions
        const allowedCompetitions = await getTokenFeatures('competition');
        if (!allowedCompetitions || allowedCompetitions.length === 0) {
            throw new Error("No competition allowed.");
        }
        filters.cid = {$in: allowedCompetitions};

        if (season) {
            filters.$or = [
                { season: String(season) },
                { season: Number(season) },
                { season: {$regex: `^${season}$`, $options: 'i' }}
            ];
        }

        if(country && apiName !== 'season_competitionlist'){
            filters.country = { $regex: country, $options: 'i' };
        }
        const pagination = getPagination(paged, per_page);
        // Total Items
        const totalItems = await CompetitionModel.countDocuments(filters);

        // Paginated Items
        const result = await CompetitionModel.find(filters, 'competitions_info highlighted highlighted_url').sort({datestart: 1}).skip(pagination.offset).limit(pagination.limit);
        if(result){
            const items = result
            .map(r => formatCompetitionInfo(r, apiName))
            .filter(item => 
                item.title && 
                item.title.trim() !== '' &&
                item.cid && 
                item.cid >= 1
            );
            const totalItemsCount = total_items_type == 'num' ? Number(totalItems) : String(totalItems);
            return itemsResponse(items, totalItemsCount, pagination.limit);
        }
        return null;
    }catch(err){
        throw err;
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
        country = getValidCountry(country);
        if(country && country != ''){
            countries.push(country.toLowerCase());
        }

        const postTypeCode = 9;

        const filters = {
            country: { $in: countries },
            $or: [
                { scheduled: 0 },
                { scheduled: { $gt: 0, $lte: currentTime } }
            ]
        };

        if (filter_type && filter_type > 0 && filter_value) {
            if(filter_type === 1){
                const matchesResult = await MatchModel.find({ cid: filter_value }, 'match_id');
                const compMatchesIds = matchesResult.map(m => Number(m.match_id));
                compMatchesIds.push(filter_value);

                filters.connectfrom = {$in: [1, 3]};
                filters.connectId = {$in: compMatchesIds};
            }else{
                filters.connectfrom = filter_type;
                filters.connectId = filter_value;
            }
        }

        if (type != 'all') {
            filters.$and = [
                { connectfrom: { $ne: postTypeCode } }
            ];
        }

        // media_platform <= 0 if latest_version
        if (latest_version) {
            filters.media_platform = { $lte: 0 };
        }

        if (news_cat) {
            filters.news_cat = Number(news_cat);
        }

        const pagination = getPagination(paged, per_page);
        // Total Items
        const totalItems = await ReelModel.countDocuments(filters);

        // Paginated Items
        const result = await ReelModel.aggregate([
        { $match: filters },
        {
            $addFields: {
                normalizedTime: {
                    $cond: [
                    { $gt: ["$orderby_time", 9999999999] },
                    { $divide: ["$orderby_time", 1000] },
                    "$orderby_time"
                    ]
                }
            }
        },
        { $sort: { normalizedTime: -1 } },
        { $skip: pagination.offset },
        { $limit: pagination.limit }
        ]);
        if (result) {
            const items = result.map(r => formatReelInfo(r));
            return itemsResponse(items, totalItems, pagination.limit);
        } 
        return null;

    } catch (err) {
        errorWithTime('Error in getReelsList:', err);
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
            paged,
            filter_type,
            filter_value,
        } = inputs;

        
        filter_type = Number(filter_type);
        filter_value = Number(filter_value);
        
        id = id > 0 ? Number(id) : 0;
        category = category > 0 ? Number(category) : 0;

        const countries = ['all'];
        country = getValidCountry(country);
        if(country && country != ''){
            countries.push(country.toLowerCase());
        }
        
        if(news_cat){
            filters.news_cat = Number(news_cat);
        }

        if(id && id > 0){
            filters.news_id = id;
        }
        if(category && category > 0){
            filters.category = category;
        }
        filters.country = { $in: countries};

        if (filter_type && filter_type > 0 && filter_value) {
            if(filter_type === 1){
                const matchesResult = await MatchModel.find({ cid: filter_value }, 'match_id');
                const compMatchesIds = matchesResult.map(m => Number(m.match_id));
                compMatchesIds.push(filter_value);

                filters.connected_to = {$in: [1, 3]};
                filters.connected_id = {$in: compMatchesIds};
            }else{
                filters.connected_to = filter_type;
                filters.connected_id = filter_value;
            }
        }
       
        const pagination = getPagination(paged, per_page);

        // Total Items
        const totalItems = await NewsModel.countDocuments(filters);

        // Paginated Items
        if(totalItems > 0){
            const result = await NewsModel.find(filters).sort({ created: -1 }).skip(pagination.offset).limit(pagination.limit);
            if(result){
                const items = result.map(r => formatNewsInfo(r));
                const response = itemsResponse(items, totalItems, pagination.limit);
                response.categories = NEWS_CATEGORIES;
                response.news_app_cat = NEWS_APP_CATEGORIES;
                return response;
            }
        }
        return null;
    }catch(err){
        return null;
    }
}

function itemsResponse(items, totalItems, limit){
    return {
        items,
        total_items: totalItems,
        total_pages: getPages(totalItems, limit)
    }
}

module.exports = {
    getFieldByAPI, 
    getMatchesList, 
    getTeamsList,
    getPlayersList,
    getCompetitionsList,
    getReelsList,
    getNewsList,
    itemsResponse
};
