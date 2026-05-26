/**
 * Calculates the start of today in East Africa Time (EAT, UTC+3)
 * and returns it as a Date object in UTC.
 */
export function getStartOfTodayInEAT(): Date {
  const UTC_OFFSET_MS = 3 * 60 * 60 * 1000; // EAT is UTC+3
  const localTime = new Date(Date.now() + UTC_OFFSET_MS);
  const year = localTime.getUTCFullYear();
  const month = localTime.getUTCMonth();
  const date = localTime.getUTCDate();
  
  // Create UTC date for local midnight and shift it back by timezone offset
  return new Date(Date.UTC(year, month, date) - UTC_OFFSET_MS);
}
