const InningModel = require('../models/inningModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getFieldName, getOffset } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        let {matchId, inningNumber, resource} = req.params;
        let {order, paged, per_page, newparam} = req.query;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        const isCommentary = resource === 'commentary';
        if(!inningNumber || inningNumber <= 0){
            inningNumber = 1;
        }
        paged = Number(paged) || 1;

        // newparam exists, ignore inningNumber
        if (isCommentary && newparam) {
            const filters = {
                match_id: Number(matchId)
            };

            let allInnings = await InningModel.find(
                    { match_id: Number(matchId) },
                    { inning_id: 1, [fieldName]: 1, iid: 1 }
                );
            
            let result = {};
            if(allInnings){
                allInnings.forEach(inning => {
                    const parsed =
                        typeof inning[fieldName] === 'string'
                            ? JSON.parse(inning[fieldName])
                            : inning[fieldName];
                    
                    const battingTeamId = parsed?.inning?.batting_team_id;

                    let teamAbbr = null;

                    if (parsed?.teams?.teama?.tid === battingTeamId) {
                        teamAbbr = parsed.teams.teama.abbr;
                    } else if (parsed?.teams?.teamb?.tid === battingTeamId) {
                        teamAbbr = parsed.teams.teamb.abbr;
                    }

                    let commentariesArray = Array.isArray(parsed?.commentaries)
                        ? [...parsed.commentaries]
                        : [];

                    const filtered = commentariesArray
                                .filter(item => item?.event !== "overend") // 👈 skip
                                .map(item => ({
                                    over: item.over,
                                    ball: item.ball,
                                    inning_score: item.inning_score,
                                    team_win_percentage: item.team_win_percentage,
                                    teamback: item.teamback,
                                    teamlay: item.teamlay,
                                    teamoddstype: item.teamoddstype,
                                    team_id: battingTeamId,
                                    team_abbr: teamAbbr
                                }));

                    result[inning.iid] = filtered;
                })
            }
            return requestSuccess({res, result});
        }

        const filters = {
            match_id: Number(matchId),
            inning_number: Number(inningNumber),
        };
        let result = await getFieldByAPI(InningModel, fieldName, filters);
        if (result && resource === 'commentary') {
            const offset = getOffset(paged, per_page);

            const parsedResult =
                typeof result === 'string' ? JSON.parse(result) : result;

            let commentariesArray = Array.isArray(parsedResult?.commentaries)
                ? [...parsedResult.commentaries]
                : [];
            
            // if (String(order).toLowerCase() === 'asc') {
            //     commentariesArray.reverse();
            // }

            parsedResult.commentaries =
                per_page > 0
                    ? commentariesArray.slice(offset, offset + per_page)
                    : commentariesArray;

            result = parsedResult;
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}