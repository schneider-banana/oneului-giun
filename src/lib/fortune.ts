/**
 * 오늘의 운세
 * 오늘 일진(日柱)의 천간이 나의 일간에게 어떤 십성인지로 풀이한다.
 */
import { Solar } from "lunar-typescript";
import { getSipsin, hanjaToKorean } from "./saju";
import { DAILY_SIPSIN, DailySipsinText } from "../data/daily-sipsin";

export interface DailyFortune {
  /** 오늘 날짜 */
  dateLabel: string;
  /** 오늘 일진 (예: 갑자) */
  dayPillar: { hanja: string; korean: string };
  /** 일진 천간의 십성 */
  sipsin: string;
  /** 총운 점수 (60-98) */
  score: number;
  /** 분야별 운세 */
  text: DailySipsinText;
  /** 행운의 색 */
  luckyColor: string;
  /** 행운의 숫자 */
  luckyNumber: number;
  /** 행운의 방향 */
  luckyDirection: string;
}

const GAN_WUXING: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화",
  무: "토", 기: "토", 경: "금", 신: "금",
  임: "수", 계: "수",
};

const WUXING_FORTUNE: Record<string, { color: string; direction: string }> = {
  목: { color: "초록", direction: "동쪽" },
  화: { color: "빨강", direction: "남쪽" },
  토: { color: "노랑", direction: "중앙" },
  금: { color: "흰색", direction: "서쪽" },
  수: { color: "검정", direction: "북쪽" },
};

/** 결정적 해시 (같은 날 같은 생년월일 → 같은 결과) */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function calcDailyFortune(
  birthY: number,
  birthM: number,
  birthD: number,
  dayStemKorean: string,
  now: Date = new Date()
): DailyFortune {
  const today = Solar.fromDate(now);
  const eight = today.getLunar().getEightChar();
  const todayGanZhi = eight.getDay(); // 한자 2글자 (예: 甲子)
  const todayStemKo = hanjaToKorean(todayGanZhi)[0];
  const todayZhiKo = hanjaToKorean(todayGanZhi)[1];

  const sipsin = getSipsin(dayStemKorean, todayStemKo);

  const seed = hash(`${birthY}-${birthM}-${birthD}|${today.toYmd()}`);
  // 같은 십성이어도 날짜(+생년월일) 해시로 variant를 돌려써서 매일 다른 풀이
  const variants = DAILY_SIPSIN[sipsin];
  const text = variants[seed % variants.length];

  const score = 60 + (seed % 39); // 60-98
  const luckyNumber = 1 + (seed % 9);

  const wx = GAN_WUXING[todayStemKo] ?? "토";
  const fortune = WUXING_FORTUNE[wx];

  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return {
    dateLabel: `${now.getFullYear()}년 ${mm}월 ${dd}일 (${weekdays[now.getDay()]})`,
    dayPillar: { hanja: todayGanZhi, korean: todayStemKo + todayZhiKo },
    sipsin,
    score,
    text,
    luckyColor: fortune.color,
    luckyNumber,
    luckyDirection: fortune.direction,
  };
}
