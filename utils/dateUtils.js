function formatDate(date=new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // month 1-12
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUnixTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function getTimestampRange(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return {
    start: Math.floor(startDate.getTime() / 1000), // UNIX timestamp in seconds
    end: Math.floor(endDate.getTime() / 1000),
  };
}

function getDateMonth(dateStr){
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'long' });
}


module.exports = { 
  formatDate, 
  toUnixTimestamp,
  getTimestampRange,
  getDateMonth
};
