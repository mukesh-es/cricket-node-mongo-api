const { MEDIA_TYPE_CODE, MEDIA_ENTITY_CODE } = require("../config/constants");
const { getDateMonth } = require("../utils/dateUtils");
const { getConfigSync } = require('../helpers/configHelper');

function getReelCDN(){
    const apiConfig = getConfigSync();
    return apiConfig.reel_cdn_path??process.env.REEL_CDN_PATH;
}

function formatCompetitionInfo(data){
    return {
        cid: data.cid,
        title: data.title??'',
        abbr: data.abbr??'',
        type: data.type??'',
        category: data.category??'',
        match_format: data.game_format??'',
        status: data.status??'',
        season: data.season??'',
        datestart: data.datestart??'',
        month: data.datestart ? getDateMonth(data.datestart) : '',
        dateend: data.dateend??'',
        country: data.country??'',
        logo_url: data.logo_url??'',
        total_matches: String(data.total_matches??0),
        total_rounds: String(data.total_rounds??0),
        total_teams: String(data.total_teams??0)
    }
}

function formatReelInfo(data){
    const reelCDN = getReelCDN();
    const cType = Number(data.ctype);
    const connectFrom = Number(data.connectfrom);
    return {
        id: data.reel_id,
        ctype: cType,
        clink: data.clink,
        connectfrom: data.connectfrom,
        connectId: data.connectId,
        title: data.title,
        subtitle: data.subtitle,
        logo_url: data.logo_url,
        timestamp: String(data.timestamp),
        updated: String(data.updated),
        scheduled: String(data.scheduled),
        orderby_time: String(data.orderby_time),
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
        created: String(data.created),
    }
}

module.exports = {formatCompetitionInfo, formatReelInfo, formatNewsInfo};