import { Lunar, Solar } from "lunar-typescript";

// Ten Gods mapping (Chinese to Korean)
const TEN_GODS_MAP: Record<string, string> = {
  "比肩": "비견",
  "劫財": "겁재",
  "食神": "식신",
  "傷官": "상관",
  "偏財": "편재",
  "正財": "정재",
  "七殺": "편관",
  "正官": "정관",
  "偏印": "편인",
  "正印": "정인",
};

// Five Elements mapping (Chinese to English)
const ELEMENTS_MAP: Record<string, string> = {
  "木": "wood",
  "火": "fire",
  "土": "earth",
  "金": "metal",
  "水": "water",
};

// Heavenly Stems (天干)
const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
];

// Earthly Branches (地支)
const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

// Five Elements for each Heavenly Stem (甲 to 癸)
const STEM_ELEMENTS = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];

// Five Elements for each Earthly Branch (子 to 亥)
const BRANCH_ELEMENTS = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"];

// Ten Gods calculation based on Day Master and compared element
// This maps: (dayMasterStem, comparedStem) -> tenGodIndex
const calculateTenGod = (dayMasterStem: string, comparedStem: string): string => {
  const dayIndex = HEAVENLY_STEMS.indexOf(dayMasterStem);
  const compareIndex = HEAVENLY_STEMS.indexOf(comparedStem);

  if (dayIndex === -1 || compareIndex === -1) {
    return "未知"; // Unknown
  }

  // Calculate the difference in the stem cycle
  const diff = (compareIndex - dayIndex + 10) % 10;

  // Ten Gods order: 比肩(0), 劫財(1), 食神(2), 傷官(3), 偏財(4), 正財(5), 七殺(6), 正官(7), 偏印(8), 正印(9)
  const tenGodChineseList = [
    "比肩",
    "劫財",
    "食神",
    "傷官",
    "偏財",
    "正財",
    "七殺",
    "正官",
    "偏印",
    "正印",
  ];

  const chineseTenGod = tenGodChineseList[diff];
  return TEN_GODS_MAP[chineseTenGod] || "未知";
};

interface PillarCharacter {
  gan: string;
  ganElement: string;
  ganGod: string;
  zhi: string;
  zhiElement: string;
  zhiGod: string;
}

interface Pillar {
  year: PillarCharacter;
  month: PillarCharacter;
  day: PillarCharacter;
  hour: PillarCharacter;
}

interface ElementCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

interface SajuResult {
  fourPillars: Pillar;
  elementCounts: ElementCount;
}

/**
 * Extract Heavenly Stem and Earthly Branch elements
 * Note: zhiGod is calculated using the first hidden stem of the branch
 */
const extractPillarCharacter = (
  gan: string,
  zhi: string,
  dayMasterGan: string
): PillarCharacter => {
  const ganIndex = HEAVENLY_STEMS.indexOf(gan);
  const zhiIndex = EARTHLY_BRANCHES.indexOf(zhi);

  // Hidden stems for each branch (first/main hidden stem)
  const hiddenStems = [
    "癸", // 子
    "癸",
    "丙", // 寅
    "乙", // 卯
    "戊", // 辰
    "丙", // 巳
    "己", // 午
    "乙", // 未
    "庚", // 申
    "辛", // 酉
    "戊", // 戌
    "壬", // 亥
  ];

  const zhiHiddenStem = hiddenStems[zhiIndex] || "未知";

  return {
    gan,
    ganElement: STEM_ELEMENTS[ganIndex] || "unknown",
    ganGod: calculateTenGod(dayMasterGan, gan),
    zhi,
    zhiElement: BRANCH_ELEMENTS[zhiIndex] || "unknown",
    zhiGod: calculateTenGod(dayMasterGan, zhiHiddenStem),
  };
};

/**
 * Calculate Four Pillars (Saju) from gregorian date and time
 * @param dateStr Format: "YYYY-MM-DD" (e.g., "1996-09-18")
 * @param timeStr Format: "HH:mm" (e.g., "11:56")
 * @returns Rich data model with Four Pillars, Ten Gods, Five Elements, and element counts
 */
export const calculateSaju = (dateStr: string, timeStr: string): SajuResult => {
  try {
    // Parse input
    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    const [hourStr, minuteStr] = timeStr.split(":");

    const gregorianYear = parseInt(yearStr, 10);
    const gregorianMonth = parseInt(monthStr, 10);
    const gregorianDay = parseInt(dayStr, 10);
    const gregorianHour = parseInt(hourStr, 10);

    // Create Solar object and convert to Lunar calendar
    const solar = new Solar(gregorianYear, gregorianMonth, gregorianDay);
    const lunar = Lunar.fromSolar(solar);

    // Get lunar date components
    const lunarYear = lunar.getYear();
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();

    // Get hour branch from gregorian hour
    // Hour branches: 子(23-1), 丑(1-3), 寅(3-5), 卯(5-7), 辰(7-9), 巳(9-11), 午(11-13), 未(13-15), 申(15-17), 酉(17-19), 戌(19-21), 亥(21-23)
    let hourBranchIndex = Math.floor((gregorianHour + 1) / 2) % 12;
    if (gregorianHour === 23) {
      hourBranchIndex = 0; // 子
    }
    const hourBranch = EARTHLY_BRANCHES[hourBranchIndex];

    // Get Year Pillar (干支)
    const yearGan = lunar.getYearGan();
    const yearZhi = lunar.getYearZhi();

    // Get Month Pillar
    const monthGan = lunar.getMonthGan();
    const monthZhi = lunar.getMonthZhi();

    // Get Day Pillar
    const dayGan = lunar.getDayGan();
    const dayZhi = lunar.getDayZhi();

    // Get Hour Pillar (calculate gan from day gan + hour)
    const dayGanIndex = HEAVENLY_STEMS.indexOf(dayGan);
    const hourGanIndex = (dayGanIndex * 2 + hourBranchIndex) % 10;
    const hourGan = HEAVENLY_STEMS[hourGanIndex];

    // Day Master (Day Gan) is used for Ten Gods calculation
    const dayMasterGan = dayGan;

    // Extract all pillars
    const yearPillar = extractPillarCharacter(yearGan, yearZhi, dayMasterGan);
    const monthPillar = extractPillarCharacter(monthGan, monthZhi, dayMasterGan);
    const dayPillar = extractPillarCharacter(dayGan, dayZhi, dayMasterGan);
    const hourPillar = extractPillarCharacter(hourGan, hourBranch, dayMasterGan);

    // Calculate element counts from all 8 characters (4 Gan + 4 Zhi)
    const elementCounts: ElementCount = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };

    const allCharacters = [
      yearPillar.ganElement,
      yearPillar.zhiElement,
      monthPillar.ganElement,
      monthPillar.zhiElement,
      dayPillar.ganElement,
      dayPillar.zhiElement,
      hourPillar.ganElement,
      hourPillar.zhiElement,
    ];

    for (const element of allCharacters) {
      if (element === "wood") elementCounts.wood++;
      else if (element === "fire") elementCounts.fire++;
      else if (element === "earth") elementCounts.earth++;
      else if (element === "metal") elementCounts.metal++;
      else if (element === "water") elementCounts.water++;
    }

    return {
      fourPillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
      },
      elementCounts,
    };
  } catch (error) {
    console.error("Error calculating Saju:", error);
    throw new Error(`Failed to calculate Saju for date ${dateStr} and time ${timeStr}`);
  }
};

// Test function
export const testSaju = () => {
  const result = calculateSaju("1996-09-18", "11:56");
  console.log("Saju Calculation Result:", JSON.stringify(result, null, 2));
  return result;
};
