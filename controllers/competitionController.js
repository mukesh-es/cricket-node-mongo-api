const HighlightModel = require('../models/highlightModel');
const CompetitionModel = require('../models/competitionModel');
const CompStatModel = require('../models/compStatModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList, getCompetitionsList } = require('../helpers/dbHelper');
const { getFieldName, getValidCountry, getFormatName, isNumeric, getOffset, getPagesCount } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');


exports.info = async(req, res) => {
    try{
        const {competitionId} = req.params;
        const filters = {cid: Number(competitionId)};
        const result = await getFieldByAPI(CompetitionModel, 'competitions_info', filters);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {competitionId, resource} = req.params;
        const queryParams = req.query;
        const {format} = queryParams;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        const filters = {
            cid: Number(competitionId),
        };
        let result;
        if(resource === 'stats'){
            // Default Stats
            result = await getFieldByAPI(CompStatModel, 'default', filters);
        }else if(resource === 'matches'){
            queryParams.cid = competitionId;
            result = await getMatchesList(queryParams);
        }else if(resource === 'crickettracker'){
            if(format){
                filters.format = isNumeric(format) ? getFormatName(format) : format;
            }
            result = await getFieldByAPI(CompStatModel, resource, filters);
        }else{
            result = await getFieldByAPI(CompetitionModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.competitions = async(req, res) => {
    try{
        const apiName = getContextValue('api_name');
        const queryParams = req.query;
        let {highlight_compilation, country} = queryParams;
        let fieldName;
        let result;

        country = getValidCountry(country);
        if(highlight_compilation && country){
            fieldName = `hightlighted_series_${country.toLowerCase()}`;
            result = await getFieldByAPI(HighlightModel, fieldName);
        }else if(apiName === 'competitions'){
            result = await getCompetitionsList(queryParams);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.stats = async(req, res) => {
    try{
        const {competitionId, statType} = req.params;
        let {format, paged, per_page} = req.query;
        let fieldName = statType;
        if(!statType){
            fieldName = 'default';
        }
        const filters = {cid: Number(competitionId)};
        if(format && format != ''){
            filters.format = { $regex: format, $options: "i" }
        }
        let result = await getFieldByAPI(CompStatModel, fieldName, filters);
        if(!result){
            result = await getFieldByAPI(CompStatModel, 'default', filters);
        }

        paged = Number(paged) || 1;
        per_page = Number(per_page) || 30;
        const offset = getOffset(paged, per_page);
        const parsedResult =
                typeof result === 'string' ? JSON.parse(result) : result;

        let statsArray = Array.isArray(parsedResult?.stats)
                ? [...parsedResult.stats]
                : [];
        const statsCount = statsArray.length;
        if(statsCount < per_page && paged > Number(parsedResult.total_pages)){
            parsedResult.stats = [];
        }else{
            parsedResult.stats =
                    per_page > 0
                        ? statsArray.slice(offset, offset + per_page)
                        : statsArray;
        }

        parsedResult.total_pages = getPagesCount(statsCount, per_page);
            

        requestSuccess({res, result: parsedResult});
    } catch(err){
        requestFailed({res, err});
    }
}