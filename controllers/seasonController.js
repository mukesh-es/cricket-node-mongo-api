const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');
const RankTourModel = require('../models/rankTourModel');
const MatchModel = require('../models/matchesModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getApiName } = require('../helpers/helpers');
const { getFieldByAPI, getCompetitionsList, getReelsList, getNewsList } = require('../helpers/dbHelper');

exports.fieldData = async(req, res) => {
    try{
        const {season, resource} = req.params;
        const queryParams = req.query;

        if(season){
            queryParams.season = season;
        }
        
        let result;

        const apiName = getApiName(req.originalUrl);
        
        if(apiName === 'season'){
            result = await getFieldByAPI(RankTourModel, 'seasons_list');
        }else if(apiName === 'season_competitions'){
            result = await getCompetitionsList(queryParams);
        }else{
            const isReel = resource == 'competitions';
            const isNews = resource == 'news';
            
            if(isReel){
                result = getReelsList(queryParams);
            }else if(isNews){
                result = getNewsList(queryParams);
            }
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}