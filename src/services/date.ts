import { DateTime } from 'luxon';

export function toUnixTimestamp(dateStr: string): number {
  try {
    const dateObj = DateTime.fromISO(dateStr);
    if (dateObj.isValid) {
      return Math.floor(dateObj.toMillis() / 1000);
    } else {
      throw new Error('Invalid date format');
    }
  } catch (error) {
    console.warn(`Invalid date format: ${dateStr}`);
    return Math.floor(DateTime.local().toMillis() / 1000);
  }
}
