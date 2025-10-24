// exports.save = async(req, res) => {
//     try{
//         const {matchId} = req.params;
//         const filePath = path.join(__dirname, '..', 'responses', 'matchInfo.json');

//         const fileData = fs.readFileSync(filePath, 'utf-8');
//         const matchInfo = JSON.parse(fileData);

//         const match = await MatchModel.findOneAndUpdate(
//             {match_id: Number(matchId)},
//             {
//                 $set: {
//                     match_info: matchInfo
//                 }
//             },
//             {new: true, upsert: true}
//         );

//         if (!match) {
//             return requestFailed({res, err: "Failed to save match info"});
//         }

//         requestSuccess({res, result});
//     }catch(err){
//         console.error('Error: ', err);
//         requestFailed({res, err});
//     }
// }

// async function getTeamMatchesList(inputs) {
//     try {
//         let filters = {};
//         let orderType = -1;

//         const { team_id, cid, paged, per_page } = inputs;

//         if (team_id && team_id > 0) {
//             filters.$or = [
//                 { teama: Number(team_id) },
//                 { teamb: Number(team_id) }
//             ];
//         }

//         if (cid && cid > 0) {
//             filters.cid = Number(cid);
//         }

//         const pagination = getPagination(paged, per_page);

//         const totalCountAgg = await MatchModel.aggregate([
//             { $match: filters },
//             { $group: { _id: "$cid" } },
//             { $count: "count" }
//         ]);

//         const totalCount = totalCountAgg?.[0]?.count || 0;

//         const result = await MatchModel.aggregate([
//             { $match: filters },
//             {
//                 $group: {
//                     _id: "$cid",
//                     latest_timestamp: { $max: "$timestamp_start" }
//                 }
//             },
//             { $sort: { latest_timestamp: orderType } },
//             { $skip: pagination.offset },
//             { $limit: pagination.limit }
//         ]);

//         const competitionsIds = result.map(r => Number(r._id));
//         return itemsResponse(competitionsIds, totalCount, pagination.limit);

//     } catch (err) {
//         console.error(err);
//         return null;
//     }
// }