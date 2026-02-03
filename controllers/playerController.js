const MatchModel = require('../models/matchesModel');
const PlayerModel = require('../models/playerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getPlayersList } = require('../helpers/dbHelper');
const { getFieldName, getOffset } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        const {playerId, resource} = req.params;

        let {paged, per_page} = req.query;

        paged = Number(paged) || 1;
        per_page = Number(per_page) || 10;

        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        const filters = {pid: Number(playerId)};
        let result = await getFieldByAPI(PlayerModel, fieldName, filters);
        if(resource === 'playermatches'){
            const offset = getOffset(paged, per_page);
            const parsedResult =
                    typeof result === 'string' ? JSON.parse(result) : result;

            let itemsArray = Array.isArray(parsedResult?.items)
                    ? [...parsedResult.items]
                    : [];
            const itemsCount = itemsArray.length;
            if(itemsCount < per_page && paged > Number(parsedResult.total_pages)){
                parsedResult.items = [];
            }else{
                parsedResult.items =
                        per_page > 0
                            ? itemsArray.slice(offset, offset + per_page)
                            : itemsArray;
            }
            result = parsedResult;
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.players = async(req, res) => {
    try{
        const queryParams = req.query;
        const {search} = queryParams;
        if(search && search.length < 5){
            return requestFailed({res, message: "Please type atleast 5 characters"});
        }
        const result = await getPlayersList(queryParams);
        return requestSuccess({res, result});
    } catch(err){
        return ({res, err});
    }
}

exports.playervsplayer = async(req, res) => {
    try{
        const {matchId} = req.params;
        const {team1, team2} = req.query;
        if(!team1 && !team2){
            requestFailed({res, message: "Both Team1 and Team2 are required"});
        }
        const matchResult = await MatchModel.findOne({match_id: matchId}).select('teama teamb match_playervsplayer_tavstb match_playervsplayer_tbvsta')
        let playerVSplayer;
        if(matchResult){
            const matchTeamA = matchResult.teama;
            const matchTeamB = matchResult.teamb;
            playerVSplayer = team1 == matchTeamA && team2 == matchTeamB ? matchResult.match_playervsplayer_tavstb : matchResult.match_playervsplayer_tbvsta;
        }
        requestSuccess({res, result: playerVSplayer});
    } catch(err){
        requestFailed({res, err});
    }
}