const MatchModel = require('../models/matchesModel');
const PlayerModel = require('../models/playerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getPlayersList } = require('../helpers/dbHelper');
const { getFieldName, getOffset, getPagesCount } = require('../helpers/helpers');
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

            // Guard: no data found
            if(!result){
                return requestSuccess({
                    res,
                    result: { items: [], total_pages: 0, total_records: 0 }
                });
            }

            const offset = getOffset(paged, per_page);

            // JSON parse with timing
            const parsedResult = (() => {
                if (typeof result !== 'string') return result;
                const start = performance.now();
                const parsed = JSON.parse(result);
                req._jsonParseTime = (req._jsonParseTime || 0) + (performance.now() - start);
                return parsed;
            })();

            // Guard: parse returned null
            if(!parsedResult){
                return requestSuccess({
                    res,
                    result: { items: [], total_pages: 0, total_records: 0 }
                });
            }

            let itemsArray = Array.isArray(parsedResult?.items)
                    ? [...parsedResult.items]
                    : [];
            const itemsCount = itemsArray.length;

            const response = { ...parsedResult }; // ✅ avoid mutating cached object

            if(itemsCount < per_page && paged > Number(parsedResult.total_pages)){
                response.items = [];
            }else{
                response.items =
                        per_page > 0
                            ? itemsArray.slice(offset, offset + per_page)
                            : itemsArray;
            }
            response.total_pages = getPagesCount(itemsCount, per_page);
            result = response;
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