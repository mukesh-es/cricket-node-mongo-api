const MatchModel = require('../models/matchesModel');
const PlayerModel = require('../models/playerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getPlayersList } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const {playerId} = req.params;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {pid: Number(playerId)};
        const result = await getFieldByAPI(PlayerModel, fieldName, filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.players = async(req, res) => {
    try{
        const queryParams = req.query;
        const result = await getPlayersList(queryParams);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.playervsplayer = async(req, res) => {
    try{
        const {matchId} = req.params;
        const {team1, team2} = req.query;
        if(!team1 && !team2){
            requestFailed(res, "Both Team1 and Team2 are required");
        }
        const matchResult = await MatchModel.findOne({match_id: matchId}).select('teama teamb match_playervsplayer_tavstb match_playervsplayer_tbvsta')
        let playerVSplayer;
        if(matchResult){
            const matchTeamA = matchResult.teama;
            const matchTeamB = matchResult.teamb;
            playerVSplayer = team1 == matchTeamA && team2 == matchTeamB ? matchResult.match_playervsplayer_tavstb : matchResult.match_playervsplayer_tbvsta;
        }
        requestSuccess(res, "Data success", playerVSplayer);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}