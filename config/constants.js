// HTTP Status Codes
const HTTP_CODE = {
  SUCCESS: 200,
  FAILED: 500,
};

const MEDIA_TYPE_CODE = {
  1: 'Image',
  2: 'Video'
};

const MEDIA_ENTITY_CODE = {
  1: 'Series',
  2: 'Teams',
  3: 'Matches',
  4: 'Players',
  9: 'Posts'
};

const NEWS_CATEGORIES = {
  1: 'Match Previews',
  2: 'Players',
  3: 'Fantasy',
  4: 'Trending',
  5: 'Controversies',
  6: 'Stats Corner'
};
const NEWS_APP_CATEGORIES = {
  1: 'Hollywood',
  2: 'Sports',
  3: 'Politics',
};

const COMPETITION_STATUS = {
  upcoming: 1,
  live: 3,
  completed: 2,
};

const DEFAULT_PERPAGE_LIMITS = {
  default: 10,
  matches: 10,
  competitions: 10,
  teams: 10,
  players: 10,
  season_competitionlist: 1000, // Competitions
  seasons_competitions: 10, // Reels
  seasons_news: 10,
  changelogs: 20
};

const CRICKET_FORMATS = {
	1 : "ODI",
	2: "Test",
	3: "T20I",
	4: "List A",
	5: "First Class",
	6: "T20",
	7: "Women ODI",
	8: "Women T20",
	9: "Youth ODI",
	10: "Youth T20",
	11: "Other",
	17: "T10",
	18: "T100",
	19: "Women T100",
};

module.exports = { 
  HTTP_CODE, 
  MEDIA_TYPE_CODE, 
  MEDIA_ENTITY_CODE,
  NEWS_CATEGORIES,
  NEWS_APP_CATEGORIES,
  DEFAULT_PERPAGE_LIMITS,
  COMPETITION_STATUS,
  CRICKET_FORMATS
};
