const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');
const RankTourModel = require('../models/rankTourModel');
const MatchModel = require('../models/matchesModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getApiName } = require('../helpers/helpers');
const { getFieldByAPI, getCompetitionsList, getReelsList, getNewsList } = require('../helpers/dbHelper');

exports.fieldData = async(req, res) => {
    try{
        const apiName = getApiName(req.originalUrl);
        const {season, resource} = req.params;
        const queryParams = req.query;
        queryParams.api_name = apiName;

        if(season){
            queryParams.season = season;
        }
        
        let result;

        
        if(apiName === 'season'){
            result = await getFieldByAPI(RankTourModel, 'seasons_list');
        }else if(apiName === 'season_competitions' || apiName === 'season_competitionlist'){
            if(apiName === 'season_competitionlist'){
                queryParams.total_items_type = 'num';
            }
            result = await getCompetitionsList(queryParams);
        }else{
            const isReel = resource == 'competitions';
            const isNews = resource == 'news';
            
            if(isReel){
                result = await getReelsList(queryParams);
            }else if(isNews){
                result = await getNewsList(queryParams);
            }
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}