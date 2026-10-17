/**
 * 토정비결 (간이판)
 *
 * 전통 토정비결의 수리법을 간소화한 버전:
 * - 상괘 = (음력 년지지 인덱스 + 음력 월 + 음력 일) % 8
 * - 하괘 = (음력 일 + 시지지 인덱스) % 8
 * 8괘 × 8괘 = 64괘 중 하나로 올해 운세를 풀이한다.
 */
import { Solar } from "lunar-typescript";
import { GUA, Gua, TRIGRAM_ORDER } from "../data/gua";

export interface TojeongResult {
  /** 괘 */
  gua: Gua;
  /** 상괘 인덱스 */
  upperIndex: number;
  /** 하괘 인덱스 */
  lowerIndex: number;
  /** 기준 연도 */
  year: number;
  /** 월별 운세 (1-12월) */
  months: { month: number; level: "길" | "평" | "흉"; text: string }[];
}

const MONTH_TEXT: Record<string, string[]> = {
  길: [
    "기회가 열리는 달. 미뤘던 일을 시작하세요.",
    "귀인의 도움이 따르는 달. 주변에 고마움을 전하세요.",
    "재물운이 트이는 달. 작은 투자도 길합니다.",
    "인연운이 좋은 달. 새로운 만남을 기대하세요.",
  ],
  평: [
    "무난히 흘러가는 달. 현재를 지키세요.",
    "크게 움직이지 말고 내실을 다지는 달.",
    "평범하지만 안정적인 달. 건강을 챙기세요.",
  ],
  흉: [
    "조심해야 하는 달. 큰 결정은 미루세요.",
    "구설·다툼을 경계하는 달. 말을 아끼세요.",
    "지출을 줄이고 몸을 사리는 달.",
  ],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function calcTojeong(
  birthY: number,
  birthM: number,
  birthD: number,
  birthH: number, // -1 = 모름
  year: number = new Date().getFullYear()
): TojeongResult {
  const solar = Solar.fromYmd(birthY, birthM, birthD);
  const lunar = solar.getLunar();
  const yearZhiIndex = lunar.getYearZhiIndex(); // 0-11
  const lunarMonth = lunar.getMonth(); // 1-12 (윤달은 음수일 수 있음)
  const lunarDay = lunar.getDay(); // 1-30
  const m = Math.abs(lunarMonth);
  const hourZhiIndex = birthH < 0 ? 0 : Math.floor(((birthH + 1) % 24) / 2); // 자시=0 … 해시=11

  const upperIndex = (yearZhiIndex + m + lunarDay) % 8;
  const lowerIndex = (lunarDay + hourZhiIndex) % 8;
  const upper = TRIGRAM_ORDER[upperIndex];
  const lower = TRIGRAM_ORDER[lowerIndex];

  const gua: Gua =
    GUA.find((g) => g.upper === upper && g.lower === lower) ?? GUA[0];

  // 월별 운세: 괘 번호 + 월로 길흉 결정 (결정적)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const seed = gua.no * 31 + month * 17 + year;
    const r = Math.abs(seed) % 10;
    const level: "길" | "평" | "흉" = r < 4 ? "길" : r < 8 ? "평" : "흉";
    return { month, level, text: pick(MONTH_TEXT[level], seed) };
  });

  return { gua, upperIndex, lowerIndex, year, months };
}
