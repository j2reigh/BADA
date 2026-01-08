import { DateTime } from 'luxon';

export interface CorrectedKSTResult {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isDstApplied: boolean;
  originalTimezone: string;
  debugInfo: {
    localTime: string;
    dstCorrectedTime: string;
    kstTime: string;
  };
}

export function getCorrectedKST(
  date: string,
  time: string,
  zone: string
): CorrectedKSTResult {
  let dt = DateTime.fromISO(`${date}T${time}`, { zone });

  const wasInDst = dt.isInDST;

  if (wasInDst) {
    dt = dt.minus({ hours: 1 });
  }

  const kst = dt.setZone('Asia/Seoul');

  return {
    year: kst.year,
    month: kst.month,
    day: kst.day,
    hour: kst.hour,
    minute: kst.minute,
    isDstApplied: wasInDst,
    originalTimezone: zone,
    debugInfo: {
      localTime: DateTime.fromISO(`${date}T${time}`, { zone }).toISO() || '',
      dstCorrectedTime: dt.toISO() || '',
      kstTime: kst.toISO() || '',
    },
  };
}

export function formatTimeForSaju(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function formatDateForSaju(year: number, month: number, day: number): string {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
