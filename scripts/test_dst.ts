import { getCorrectedKST } from '../lib/time_utils';

// Test 1: New York summer birth (DST active)
const nyResult = getCorrectedKST('1995-08-03', '07:00', 'America/New_York');
console.log('New York Summer (DST expected):');
console.log('  DST Applied:', nyResult.isDstApplied);
console.log('  KST Result:', `${nyResult.year}-${nyResult.month}-${nyResult.day} ${nyResult.hour}:${nyResult.minute}`);
console.log('  Debug:', nyResult.debugInfo);

// Test 2: Seoul (no DST)
const seoulResult = getCorrectedKST('1995-08-03', '07:00', 'Asia/Seoul');
console.log('\nSeoul (No DST):');
console.log('  DST Applied:', seoulResult.isDstApplied);
console.log('  KST Result:', `${seoulResult.year}-${seoulResult.month}-${seoulResult.day} ${seoulResult.hour}:${seoulResult.minute}`);

// Test 3: London summer (DST active)
const londonResult = getCorrectedKST('1995-07-15', '14:30', 'Europe/London');
console.log('\nLondon Summer (DST expected):');
console.log('  DST Applied:', londonResult.isDstApplied);
console.log('  KST Result:', `${londonResult.year}-${londonResult.month}-${londonResult.day} ${londonResult.hour}:${londonResult.minute}`);
console.log('  Debug:', londonResult.debugInfo);

// Test 4: New York winter (no DST)
const nyWinterResult = getCorrectedKST('1995-01-15', '10:00', 'America/New_York');
console.log('\nNew York Winter (No DST):');
console.log('  DST Applied:', nyWinterResult.isDstApplied);
console.log('  KST Result:', `${nyWinterResult.year}-${nyWinterResult.month}-${nyWinterResult.day} ${nyWinterResult.hour}:${nyWinterResult.minute}`);
