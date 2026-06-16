export function formatTimeAgo(dateInput: Date | string | number) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  // Adjust for Oracle DB timestamp (UTC) being parsed as Local by node-oracledb
  // by adding the timezone offset back.
  const offset = new Date().getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - offset);
  
  const seconds = Math.floor((new Date().getTime() - adjustedDate.getTime()) / 1000);
  if (seconds < 0) return 'Just now';
  
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  interval = seconds / 604800;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " week ago" : " weeks ago");
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " min ago";
  return Math.floor(seconds) + " sec ago";
}
