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
    "기회가 열리는 달. 미뤘던 일을 지금 시작하자. 망설이면 남의 것이 된다. 이번 달의 실행력이 올해 농사를 결정한다.",
    "귀인의 도움이 따르는 달. 주변에 고마움을 전해보자. 베푼 만큼 돌아온다. 뜻밖의 곳에서 손 내미는 사람이 생긴다.",
    "재물운이 트이는 달. 작은 투자도 길하다. 단, 욕심은 금물이다. 들어오는 돈을 잘 굴리면 불어난다.",
    "인연운이 좋은 달. 새로운 만남을 기대해보자. 먼저 손 내밀어라. 좋은 인연은 기다리는 게 아니라 만드는 거다.",
    "추진력이 붙는 달. 하고 싶던 걸 밀어붙여라. 지금이 타이밍이다. 망설이던 그 일, 이번 달에 결판내자.",
  ],
  평: [
    "무난히 흘러가는 달. 현재를 지키는 게 답이다. 무리하지 마라. 조용히 가는 달도 필요하다.",
    "크게 움직이지 말고 내실을 다지는 달. 조용히 실력을 쌓아라. 겉으로 안 보여도 속은 단단해진다.",
    "평범하지만 안정적인 달. 건강을 챙기자. 기본이 답이다. 루틴을 지키는 게 최고의 전략이다.",
    "별일 없이 지나가는 달. 이럴 때일수록 루틴을 지켜라. 평온한 달이 다음 도약을 준비한다.",
  ],
  흉: [
    "조심해야 하는 달. 큰 결정은 미뤄라. 서두르면 손해다. 지금은 버티는 게 이기는 때다.",
    "구설과 다툼을 경계하는 달. 말을 아끼자. 침묵이 금이다. 한마디 참으면 열 마디 이득이다.",
    "지출을 줄이고 몸을 사리는 달. 수비적으로 가라. 나가는 구멍부터 막아야 한다.",
    "컨디션 난조에 유의하는 달. 무리하지 말고 쉬어라. 쉬는 것도 실력이다. 재충전의 달로 삼아라.",
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
