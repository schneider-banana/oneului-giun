/**
 * 궁합 계산 (온디바이스)
 * - 두 사람의 일간 오행 상생/상극 + 십성 관계를 점수화
 * - 0~100점 + 분야별(성격/소통/금전) 풀이는 src/data/match-text.ts
 */
import type { Oheng, SajuResult, Sipsin } from "./saju";
import { getSipsin } from "./saju";

const STEM_OHENG: Record<string, Oheng> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

/** A가 B를 생한다 */
const GENERATES: Record<Oheng, Oheng> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};

/** A가 B를 극한다 */
const CONTROLS: Record<Oheng, Oheng> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
};

export type OhengRelation = "상생" | "상극" | "같은 오행";

/** 길성/흉성 가중치 */
function sipsinWeight(s: Sipsin): number {
  switch (s) {
    case "식신":
    case "정재":
    case "정관":
    case "정인":
    case "비견":
      return 8;
    case "편재":
    case "편인":
      return 3;
    case "상관":
    case "겁재":
    case "편관":
      return -5;
  }
}

export interface MatchResult {
  /** 0~100 */
  score: number;
  ohengRelation: OhengRelation;
  /** 예: "목생화" */
  ohengDetail: string;
  /** A의 일간이 B에게 어떤 십성인지 */
  sipsinAtoB: Sipsin;
  /** B의 일간이 A에게 어떤 십성인지 */
  sipsinBtoA: Sipsin;
  aOheng: Oheng;
  bOheng: Oheng;
}

export function calcMatch(a: SajuResult, b: SajuResult): MatchResult {
  const aOheng = STEM_OHENG[a.dayStem] ?? "토";
  const bOheng = STEM_OHENG[b.dayStem] ?? "토";

  let score = 50;
  let ohengRelation: OhengRelation;
  let ohengDetail: string;

  if (aOheng === bOheng) {
    ohengRelation = "같은 오행";
    ohengDetail = `둘 다 ${aOheng}의 기운`;
    score += 10;
  } else if (GENERATES[aOheng] === bOheng) {
    ohengRelation = "상생";
    ohengDetail = `${aOheng}생${bOheng} — A가 B를 돕는 관계`;
    score += 20;
  } else if (GENERATES[bOheng] === aOheng) {
    ohengRelation = "상생";
    ohengDetail = `${bOheng}생${aOheng} — B가 A를 돕는 관계`;
    score += 20;
  } else if (CONTROLS[aOheng] === bOheng) {
    ohengRelation = "상극";
    ohengDetail = `${aOheng}극${bOheng} — 부딪힐 수 있는 관계`;
    score -= 15;
  } else {
    ohengRelation = "상극";
    ohengDetail = `${bOheng}극${aOheng} — 부딪힐 수 있는 관계`;
    score -= 15;
  }

  // 서로의 일간이 상대에게 어떤 십성인지
  const sipsinAtoB = getSipsin(b.dayStem, a.dayStem);
  const sipsinBtoA = getSipsin(a.dayStem, b.dayStem);
  score += sipsinWeight(sipsinAtoB);
  score += sipsinWeight(sipsinBtoA);

  score = Math.max(5, Math.min(98, Math.round(score)));

  return {
    score,
    ohengRelation,
    ohengDetail,
    sipsinAtoB,
    sipsinBtoA,
    aOheng,
    bOheng,
  };
}
