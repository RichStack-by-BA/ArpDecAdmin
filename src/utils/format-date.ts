// Utility function to format a date string or Date object
// Usage: formatDate(date, 'YYYY-MM-DD HH:mm:ss')

export function formatDate(date: string | Date, format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  // Default user-friendly format: "December 24, 2025, 2:30 PM"
  if (!format) {
    const month = d.toLocaleString('default', { month: 'long' });
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minuteStr = minutes < 10 ? '0' + minutes : minutes;
    return `${month} ${day}, ${year}, ${hours}:${minuteStr} ${ampm}`;
  }

  // Pad helper
  const pad = (n: number) => n < 10 ? '0' + n : n.toString();

  // Replace tokens in format string
  return format
    .replace(/YYYY/g, d.getFullYear().toString())
    .replace(/MM/g, pad(d.getMonth() + 1))
    .replace(/DD/g, pad(d.getDate()))
    .replace(/HH/g, pad(d.getHours()))
    .replace(/mm/g, pad(d.getMinutes()))
    .replace(/ss/g, pad(d.getSeconds()));
}
