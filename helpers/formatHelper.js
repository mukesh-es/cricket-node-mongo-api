const { MEDIA_TYPE_CODE, MEDIA_ENTITY_CODE } = require("../config/constants");
const { getDateMonth, normalizeToSeconds, getTimeAgo } = require("../utils/dateUtils");
const { getConfigSync } = require('../helpers/configHelper');

function getReelCDN(){
    const apiConfig = getConfigSync();
    return apiConfig.reel_cdn_path??process.env.REEL_CDN_PATH;
}

function formatCompetitionInfo(row, apiName=''){
    const isSeasonCompetitions = apiName === 'season_competitionlist';
    row = JSON.parse(JSON.stringify(row));
    const data = JSON.parse(row.competitions_info || '{}');
    let info = {
        cid: data.cid,
        title: data.title??'',
        abbr: data.abbr??'',
        category: data.category??'',
        status: data.status??'',
        season: data.season??'',
        datestart: data.datestart??'',
        dateend: data.dateend??'',
        country: data.country??'',
        logo_url: data.logo_url??'',
        total_matches: String(data.total_matches??0),
        total_rounds: String(data.total_rounds??0),
        total_teams: String(data.total_teams??0)
    }

    if(isSeasonCompetitions){
        info.type = data.type??'';
        info.match_format = data.game_format??'';
        info.month = data.datestart ? getDateMonth(data.datestart) : '';

        if(Number(row.highlighted) === 1){
            info.highlighted = row.highlighted;
        }
        if (row.highlighted_url && row.highlighted_url != '0') {
            info.highlighted_url = row.highlighted_url;
        }
    }else{
        info.game_format = data.game_format??'';
    }
    return info;
}

function formatReelInfo(data){
    const reelCDN = getReelCDN();
    const cType = Number(data.ctype);
    const connectFrom = Number(data.connectfrom);
    const timestampSeconds = normalizeToSeconds(data.timestamp);
    const updatedSeconds = normalizeToSeconds(data.updated);
    const scheduledSeconds = normalizeToSeconds(data.scheduled);
    const orderbyTimeSeconds = normalizeToSeconds(data.orderby_time);

    return {
        id: data.reel_id,
        ctype: cType,
        clink: data.clink,
        connectfrom: data.connectfrom,
        connectId: data.connectId,
        title: data.title,
        subtitle: data.subtitle,
        logo_url: data.logo_url,
        timestamp: String(timestampSeconds),
        updated: String(updatedSeconds),
        scheduled: String(scheduledSeconds),
        orderby_time: String(orderbyTimeSeconds),
        credit_title: data.credit_title,
        credit_url: data.credit_url,
        thumbnail: `${data.thumbnail ? `${reelCDN}thumbnail/${data.thumbnail}` : ''}`,
        category: Number(data.category),
        country: data.country,
        media_platform: Number(data.media_platform),
        news_cat: Number(data.news_cat),
        ctype_str: MEDIA_TYPE_CODE[cType]??'',
        connectfrom_str: MEDIA_ENTITY_CODE[connectFrom]??'',
        cdnlink: `${reelCDN}${data.clink}`,
        published: getTimeAgo(orderbyTimeSeconds),
    }
}

function formatNewsInfo(data){
    const reelCDN = getReelCDN();
    let tags = [];
    if (data.tags) {
        const expTags = data.tags.split('#');
        
        for (let tag of expTags) {
            tag = tag.trim().replace(/\s+/g, '');
            if (tag) {
                tags.push('#' + tag);
            }
        }
    }
    const createdSeconds = normalizeToSeconds(data.created);
    
    return {
        news_id: String(data.news_id),
        title: data.title,
        news_body: data.news_body,
        media_type: String(data.media_type),
        media_url: `${reelCDN}news/${data.media_url}`,
        redirect: data.redirect??'',
        connected_to: String(data.connected_to),
        connected_id: String(data.connected_id),
        news_url: data.news_url,
        tags: tags,
        credit: String(data.credit),
        created: String(createdSeconds),
        published: getTimeAgo(createdSeconds),
    }
}

function formatChangeLogList(data){
    const reelCDN = getReelCDN();
    let info = {
        id: data.id,
        title: data.title??'',
        subtitle: data.subtitle??'',
        img_url: `${data.img_url ? `${reelCDN}change_logs/${data.img_url}` : ''}`,
        created: data.created ? dayMonthAbbrYear(data.created) : '',
    }
    return info;
}

function formatChangeLogInfo(data){
    const reelCDN = getReelCDN();
    let info = {
        id: data.id,
        title: data.title??'',
        subtitle: data.subtitle??'',
        description: data.description??'',
        img_url: `${data.img_url ? `${reelCDN}change_logs/${data.img_url}` : ''}`,
        created: data.created,
    }
    return info;
}

const dayMonthAbbrYear = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp * 1000);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };

  const [day, month, year] = date.toLocaleDateString('en-GB', options).split(' ');
  return `${day} ${month}, ${year}`;
};

module.exports = {
    formatCompetitionInfo, 
    formatReelInfo, 
    formatNewsInfo, 
    formatChangeLogList,
    formatChangeLogInfo
};