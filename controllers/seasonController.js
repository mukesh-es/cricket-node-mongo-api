const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');
const RankTourModel = require('../models/rankTourModel');
const MatchModel = require('../models/matchesModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getCompetitionsList, getReelsList, getNewsList } = require('../helpers/dbHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        const apiName = getContextValue('api_name');
        const {season, resource} = req.params;
        const queryParams = req.query;

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