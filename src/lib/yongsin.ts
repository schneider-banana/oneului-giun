/**
 * 용신/희신 간이 분석 (정통사주 리포트용)
 *
 * 정통 명리학의 용신은 월령, 일간의 강약, 계절 등을 종합해 정한다.
 * 여기서는 기초 이해용 간이 버전: 오행 분포에서 가장 부족한 기운을
 * 용신 후보로, 용신을 생하는 오행을 희신으로 안내한다.
 */
import type { Oheng, SajuResult } from "./saju";

/** A가 B를 생한다 (상생) */
const GENERATES: Record<Oheng, Oheng> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const STEM_OHENG: Record<string, Oheng> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

export interface YongsinResult {
  /** 일간의 오행 */
  dayStemOheng: Oheng;
  /** 가장 부족한 오행 (용신 후보) */
  weakest: Oheng;
  /** 가장 많은 오행 */
  strongest: Oheng;
  /** 용신 (간이) */
  yongsin: Oheng;
  /** 희신 = 용신을 생하는 오행 */
  huisin: Oheng;
  weakestCount: number;
  strongestCount: number;
}

export function calcYongsin(result: SajuResult): YongsinResult {
  const order: Oheng[] = ["목", "화", "토", "금", "수"];
  let weakest: Oheng = "목";
  let strongest: Oheng = "목";
  for (const o of order) {
    if (result.fiveElements[o] < result.fiveElements[weakest]) weakest = o;
    if (result.fiveElements[o] > result.fiveElements[strongest]) strongest = o;
  }
  const dayStemOheng = STEM_OHENG[result.dayStem] ?? "토";
  const yongsin = weakest;
  // 희신 = 용신을 생하는 오행
  const huisin = (Object.keys(GENERATES) as Oheng[]).find((k) => GENERATES[k] === yongsin) ?? "목";
  return {
    dayStemOheng,
    weakest,
    strongest,
    yongsin,
    huisin,
    weakestCount: result.fiveElements[weakest],
    strongestCount: result.fiveElements[strongest],
  };
}

/** 용신/희신 기초 설명 */
export const YONGSIN_GUIDE: string[] = [
  "용신은 사주에서 가장 필요한 기운이다. 부족한 걸 채워주는 영양제 같은 거다. 희신은 용신을 돕는 기운, 용신의 조력자다.",
  "정통 명리학에선 월령과 일간의 강약, 계절까지 따져 용신을 정한다. 꽤 복잡하다. 여기선 기초 이해용으로, 오행 분포에서 가장 부족한 기운을 용신 후보로 잡는다.",
  "용신에 맞는 색이나 방향, 환경을 가까이하면 운의 흐름이 부드러워진다. 부족한 기운을 채우는 게 포인트다. 억지로 바꾸려 하지 말고, 조금씩 곁에 두는 것부터 시작해라.",
];

/** 용신 오행별 생활 팁 */
export const YONGSIN_TIP: Record<Oheng, string> = {
  목: "초록 계열을 가까이하고, 동쪽 방향과 나무, 식물을 곁에 둬라. 성장하고 배우는 활동이 기운을 채운다.",
  화: "빨강 계열과 남쪽 방향이 좋다. 사람들과 어울리고, 밝은 곳에서 활동해라. 열정이 기운을 채운다.",
  토: "노랑, 갈색 계열과 중앙이 좋다. 루틴을 만들고 땅을 다지는 생활이 기운을 채운다.",
  금: "흰색, 회색 계열과 서쪽 방향이 좋다. 정리하고 다듬는 활동이 기운을 채운다.",
  수: "파랑, 검정 계열과 북쪽 방향이 좋다. 쉬고, 생각하고, 흐르는 대로 두는 시간이 기운을 채운다.",
};
