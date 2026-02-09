import { Solar } from "lunar-typescript";

// 1996-09-18 11:56 여자
const solar = Solar.fromYmdHms(1996, 9, 18, 11, 56, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

// 운 계산 (gender: 1=남, 0=여)
const yun = eightChar.getYun(0); // 여자

console.log("=== 기본 정보 ===");
console.log("시작 나이:", yun.getStartYear(), "세");
console.log("순행/역행:", yun.isForward() ? "순행" : "역행");

console.log("\n=== 대운 (10개) ===");
const daYunList = yun.getDaYun(10);
daYunList.forEach((dy, i) => {
  console.log(i + ": " + dy.getStartAge() + "세~" + dy.getEndAge() + "세 | " + dy.getGanZhi());
});

console.log("\n=== 현재 대운 (29세) ===");
const currentDaYun = daYunList.find(dy => dy.getStartAge() <= 29 && dy.getEndAge() >= 29);
if (currentDaYun) {
  console.log("현재 대운:", currentDaYun.getGanZhi());
  console.log("기간:", currentDaYun.getStartAge() + "~" + currentDaYun.getEndAge() + "세");

  console.log("\n=== 세운 (유년) ===");
  const liuNianList = currentDaYun.getLiuNian(5);
  liuNianList.forEach(ln => {
    console.log("  " + ln.getYear() + "년: " + ln.getGanZhi() + " (" + ln.getAge() + "세)");
  });
}
