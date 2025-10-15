const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');
const RankTourModel = require('../models/rankTourModel');
const MatchModel = require('../models/matchesModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getPagination, getApiName } = require('../utils/helpers');
const { getFieldByAPI } = require('../utils/dbHelper');

exports.fieldData = async(req, res) => {
    try{
        const {season, resource} = req.params;
        let {
            id,
            filter_type, 
            filter_value, 
            country, 
            category,
            type,
            latest_version,
            news_cat,
            per_page, 
            paged
        } = req.query;

        
        let result;
        const filters = {};

        id = id > 0 ? Number(id) : 0;
        filter_type = Number(filter_type);
        filter_value = Number(filter_value);

        const apiName = getApiName(req.originalUrl);
        const currentTime = Date.now() + (5 * 60 * 60 * 1000) + (30 * 60 * 1000);
        if(apiName === 'season'){
            result = await getFieldByAPI(RankTourModel, 'seasons_list');
        }else{
            let resourceModel;
            let orderBy;
            const pagination = getPagination(paged, per_page);
            const isReel = resource == 'competitions';
            const isNews = resource == 'news';

            if(news_cat){
                filters.news_cat = Number(news_cat);
            }

            const countries = ['all'];
            if(country && country != ''){
                countries.push(country.toLowerCase());
            }
            
            if(isReel){
                resourceModel = ReelModel;
                orderBy = { orderby_time: -1 };

                const isCompMatches = filter_type && filter_type == 1 && filter_value;
                let compMatchesIds = [];
                const postTypeCode = 9;
                if(isCompMatches){
                    const matchesResult = await MatchModel.find({cid: filter_value}, 'match_id');
                    if(matchesResult){
                        compMatchesIds = matchesResult.map(match => match.match_id);
                    }
                    compMatchesIds.push(filter_value);
                }
                
                if(isCompMatches && compMatchesIds.length > 0){
                    filters.connectfrom = { $in: [1,3]};
                    filters.connectId = { $in: compMatchesIds };
                }else if(filter_type && filter_value){
                    filters.connectfrom = filter_type;
                    filters.connectId = filter_value;
                }
                if(type != 'all'){
                    filters.connectfrom = { $ne: postTypeCode };
                }
                if(latest_version){
                    filters.media_platform = { $lte: 0 }
                }
    
                filters.$and = [
                    {
                    $or: [
                        { scheduled: { $gt: 0, $lte: currentTime } },
                        { scheduled: 0 }
                    ]
                    },
                    { country: { $in: countries } }
                ];  
            }else if(isNews){
                resourceModel = NewsModel;
                orderBy = { news_id: -1 };

                if(id && id > 0){
                    filters.news_id = id;
                }
                if(category){
                    filters.category = category;
                }
                filters.country = { $in: countries};
            }
            result = await resourceModel.find(filters).sort(orderBy).skip(pagination.offset).limit(pagination.limit);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong", err);
    }
}