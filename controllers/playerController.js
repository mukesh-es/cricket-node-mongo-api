const MatchModel = require('../models/matchesModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

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
        const response = {
            status: "ok",
            response: playerVSplayer ? playerVSplayer : []
        }
        requestSuccess(res, "Data success", response);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}