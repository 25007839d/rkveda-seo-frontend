function localIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export function getGa4DateRange(days = '30') {
  const count = Math.max(1, Number(days) || 30);
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - (count - 1));
  return { startDate: localIsoDate(start), endDate: localIsoDate(end) };
}
