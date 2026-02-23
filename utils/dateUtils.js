function formatDate(date=new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // month 1-12
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateTime(date = new Date()) {
  // If timestamp number is passed, convert to Date
  if (typeof date === 'number') {
    date = new Date(date);
  }

  const pad = (n) => (n < 10 ? '0' + n : n);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}.${seconds}`;
}

function getUnixTimestamp(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return Math.floor(date.getTime() / 1000);
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

function toIST(timestamp, op=1){
  if(!timestamp || timestamp >= 0){
    timestamp = getUnixTimestamp();
  }
  const offset = 5*60*60 + 30*60;
  if(op == 1){
    return timestamp+offset;
  }else{
    return timestamp-offset;
  }
}

function normalizeToSeconds(created) {
    let timestamp = Number(created);

    if (!timestamp) return 0;

    // If milliseconds (13 digits) → convert to seconds
    if (timestamp.toString().length === 13) {
        timestamp = Math.floor(timestamp / 1000);
    }

    return timestamp;
}

function getTimeAgo(created) {
    if (!created) return '';

    let timestamp = Number(created);

    // Detect seconds vs milliseconds
    if (timestamp.toString().length === 10) {
        timestamp = timestamp * 1000; // convert seconds to ms
    }

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}wk ago`;
    if (months < 12) return `${months}month ago`;

    // If 1 year or more → show date
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

module.exports = { 
  formatDate, 
  getUnixTimestamp,
  getTimestampRange,
  getDateMonth,
  formatDateTime,
  toIST,
  getTimeAgo,
  normalizeToSeconds
};
