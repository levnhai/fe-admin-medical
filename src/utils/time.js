// get hour/minutes
export function extractTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const hours = date.getUTCHours();
  const minutes = date.getMinutes();
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return formattedTime;
}

// format date
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
export function generateYears(startYear) {
  const currentYear = new Date().getFullYear();
  let years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
}

export function generateMonths() {
  let months = [];
  for (let i = 1; i <= 12; i++) {
    months.push({ value: i.toString(), label: i.toString() });
  }
  return months;
}

export function generateDays() {
  let days = [];
  for (let i = 1; i <= 31; i++) {
    days.push({ value: i.toString(), label: i.toString() });
  }
  return days;
}
