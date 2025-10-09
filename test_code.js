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
//             return requestFailed(res, "Failed to save match info");
//         }

//         requestSuccess(res, "Saved successfully");
//     }catch(err){
//         console.error('Error: ', err);
//         requestFailed(res, "Something went wrong!");
//     }
// }