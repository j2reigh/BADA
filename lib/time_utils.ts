import { DateTime } from 'luxon';
import tzlookup from '@photostructure/tz-lookup';

export interface TrueSolarTimeResult {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  debug: {
    originalTime: string;       // "HH:MM" wall clock input
    timezone: string;           // IANA timezone (derived or passed)
    utcOffsetHours: number;     // e.g. +7 for WIB (includes DST)
    standardOffsetHours: number; // DST 제거한 표준 offset
    stdMeridian: number;        // standardOffsetHours × 15
    isDst: boolean;
    dstCorrectionMin: number;   // 60 if DST, 0 otherwise
    lmtOffsetMin: number;       // (lon - stdMeridian) × 4
    eotMin: number;             // equation of time
    totalCorrectionMin: number; // lmt + eot - dst
    trueSolarTime: string;      // "HH:MM" final
    dateCrossed: 'none' | 'next' | 'prev';
  };
}

/**
 * Calculate True Solar Time from wall clock time + coordinates.
 *
 * Steps:
 * 1. geo-tz → IANA timezone from lat/lon
 * 2. Luxon → DST detection + UTC offset
 * 3. Standard meridian = utcOffsetHours × 15
 * 4. LMT correction = (longitude - stdMeridian) × 4 minutes
 * 5. Equation of Time (EoT) approximation
 * 6. TST = wallClock + lmtOffset + EoT - DST(60min)
 * 7. Midnight boundary handling
 */
export function calculateTrueSolarTime(
  date: string,        // "YYYY-MM-DD"
  time: string,        // "HH:MM"
  latitude: number,
  longitude: number,
): TrueSolarTimeResult {
  // 1. Derive IANA timezone from coordinates (pure JS, no filesystem)
  const timezone = tzlookup(latitude, longitude) || 'UTC';

  // 2. Parse in local timezone to get DST and UTC offset
  const dt = DateTime.fromISO(`${date}T${time}`, { zone: timezone });
  const isDst = dt.isInDST;
  const utcOffsetHours = dt.offset / 60; // Luxon offset is in minutes (includes DST)

  // 3. Standard meridian — must use STANDARD offset (without DST)
  //    Otherwise DST gets double-counted: once in stdMeridian, once in explicit correction
  const standardOffsetHours = isDst ? utcOffsetHours - 1 : utcOffsetHours;
  const stdMeridian = Math.round(standardOffsetHours) * 15;

  // 4. LMT correction (4 minutes per degree of longitude difference)
  const lmtOffsetMin = (longitude - stdMeridian) * 4;

  // 5. Equation of Time (Spencer formula approximation)
  const [yr, mo, dy] = date.split('-').map(Number);
  const startOfYear = new Date(yr, 0, 1);
  const currentDate = new Date(yr, mo - 1, dy);
  const dayOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / 86400000) + 1;
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eotMin = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // 6. DST correction: if DST is active, subtract 60 minutes
  const dstCorrectionMin = isDst ? 60 : 0;

  // 7. Total correction & True Solar Time
  const totalCorrectionMin = lmtOffsetMin + eotMin - dstCorrectionMin;

  const [wallHour, wallMinute] = time.split(':').map(Number);
  let totalMinutes = wallHour * 60 + wallMinute + totalCorrectionMin;

  // 8. Midnight boundary handling
  let dateCrossed: 'none' | 'next' | 'prev' = 'none';
  let resultDate = DateTime.fromISO(date);

  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    resultDate = resultDate.plus({ days: 1 });
    dateCrossed = 'next';
  } else if (totalMinutes < 0) {
    totalMinutes += 1440;
    resultDate = resultDate.minus({ days: 1 });
    dateCrossed = 'prev';
  }

  const tstHour = Math.floor(totalMinutes / 60);
  const tstMinute = Math.round(totalMinutes % 60);

  return {
    year: resultDate.year,
    month: resultDate.month,
    day: resultDate.day,
    hour: tstHour,
    minute: tstMinute,
    debug: {
      originalTime: time,
      timezone,
      utcOffsetHours,
      standardOffsetHours,
      stdMeridian,
      isDst,
      dstCorrectionMin,
      lmtOffsetMin: Math.round(lmtOffsetMin * 100) / 100,
      eotMin: Math.round(eotMin * 100) / 100,
      totalCorrectionMin: Math.round(totalCorrectionMin * 100) / 100,
      trueSolarTime: `${tstHour.toString().padStart(2, '0')}:${tstMinute.toString().padStart(2, '0')}`,
      dateCrossed,
    },
  };
}

/** @deprecated Use calculateTrueSolarTime() with lat/lon for accurate results */
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
