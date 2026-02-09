import { Solar } from "lunar-typescript";
import { calculateLuckCycle } from "../lib/behavior_translator";

// 1996-09-18 11:56 여자
const solar = Solar.fromYmdHms(1996, 9, 18, 11, 56, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

console.log("=== 기본 사주 정보 ===");
console.log("일간 (Day Master):", eightChar.getDayGan());
console.log("사주:", eightChar.getYearGan() + eightChar.getYearZhi(), eightChar.getMonthGan() + eightChar.getMonthZhi(), eightChar.getDayGan() + eightChar.getDayZhi(), eightChar.getTimeGan() + eightChar.getTimeZhi());

// 운 계산 (gender: 1=남, 0=여)
const yun = eightChar.getYun(0); // 여자

console.log("\n=== 대운 (10개) ===");
const daYunList = yun.getDaYun(10);
daYunList.forEach((dy, i) => {
  console.log(i + ": " + dy.getStartAge() + "세~" + dy.getEndAge() + "세 | " + dy.getGanZhi());
});

console.log("\n=== Enhanced calculateLuckCycle() ===");
const result = calculateLuckCycle("1996-09-18", "11:56", "F");

if (result) {
  console.log("\n일간:", result.dayMaster);

  console.log("\n── 이전 대운 ──");
  if (result.previousDaYun) {
    const p = result.previousDaYun;
    console.log(`${p.ganZhi} (${p.startAge}-${p.endAge}세)`);
    console.log(`  천간: ${p.ganZhi[0]} ${p.ganElement} → 십신: ${p.tenGodGan}`);
    console.log(`  지지: ${p.ganZhi[1]} ${p.zhiElement} → 십신: ${p.tenGodZhi}`);
  } else {
    console.log("  없음");
  }

  console.log("\n── 현재 대운 ──");
  const c = result.currentDaYun;
  console.log(`${c.ganZhi} (${c.startAge}-${c.endAge}세)`);
  console.log(`  천간: ${c.ganZhi[0]} ${c.ganElement} → 십신: ${c.tenGodGan}`);
  console.log(`  지지: ${c.ganZhi[1]} ${c.zhiElement} → 십신: ${c.tenGodZhi}`);

  console.log("\n── 다음 대운 ──");
  if (result.nextDaYun) {
    const n = result.nextDaYun;
    console.log(`${n.ganZhi} (${n.startAge}-${n.endAge}세)`);
    console.log(`  천간: ${n.ganZhi[0]} ${n.ganElement} → 십신: ${n.tenGodGan}`);
    console.log(`  지지: ${n.ganZhi[1]} ${n.zhiElement} → 십신: ${n.tenGodZhi}`);
  } else {
    console.log("  없음");
  }

  console.log("\n── 세운 (올해) ──");
  const s = result.currentSeUn;
  console.log(`${s.year}년: ${s.ganZhi}`);
  console.log(`  천간: ${s.ganZhi[0]} ${s.ganElement} → 십신: ${s.tenGodGan}`);
  console.log(`  지지: ${s.ganZhi[1]} ${s.zhiElement} → 십신: ${s.tenGodZhi}`);

  console.log("\n── 대운 위치 ──");
  console.log(result.cyclePhase);
  console.log("순행/역행:", result.isForward ? "순행" : "역행");
} else {
  console.log("계산 실패!");
}
