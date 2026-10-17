/**
 * 오늘의기운 — 사주 계산 엔진
 *
 * - 사주팔자(년·월·일·시주): lunar-typescript (MIT) — 절기(입춘/12절기) 기준, 경계값 검증됨
 * - 음력→양력 변환: korean-lunar-calendar (MIT, KARI 표준)
 * - 오행·십성은 명리학 표준 규칙으로 직접 계산
 */
import { Solar } from "lunar-typescript";
import KoreanLunarCalendar from "korean-lunar-calendar";

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

/** 천간+지지 한 기둥 */
export interface Pillar {
  /** 천간 (한글, 예: "경") */
  stem: string;
  /** 지지 (한글, 예: "오") */
  branch: string;
  /** 한자 표기 (예: "庚午") */
  hanja: string;
  /** 한글 표기 (예: "경오") */
  korean: string;
}

/** 사주팔자 */
export interface SajuResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  /** 태어난 시간 미상이면 null */
  time: Pillar | null;
  /** 일간 (나 자신, 예: "경") */
  dayStem: string;
  /** 오행 분포 { 목: n, 화: n, 토: n, 금: n, 수: n } */
  fiveElements: Record<Oheng, number>;
}

export type Oheng = "목" | "화" | "토" | "금" | "수";

export interface SajuInput {
  year: number;
  month: number;
  day: number;
  /** 0~23. 모르면 -1 */
  hour?: number;
  /** 음력 입력 여부 */
  isLunar?: boolean;
  /** 윤달 여부 (음력일 때) */
  isLeapMonth?: boolean;
}

// ---------------------------------------------------------------------------
// 오행 매핑 (표준)
// ---------------------------------------------------------------------------

const STEM_OHENG: Record<string, Oheng> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

const BRANCH_OHENG: Record<string, Oheng> = {
  인: "목", 묘: "목",
  사: "화", 오: "화",
  진: "토", 술: "토", 축: "토", 미: "토",
  신: "금", 유: "금",
  해: "수", 자: "수",
};

/** 한자 천간 → 한글 */
const HANJA_STEM: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};

/** 한자 지지 → 한글 */
const HANJA_BRANCH: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

/** 한자 간지 → 한글 (예: 甲子 → 갑자) */
export function hanjaToKorean(hanja2: string): string {
  if (hanja2.length < 2) return hanja2;
  const stem = HANJA_STEM[hanja2[0]] ?? hanja2[0];
  const branch = HANJA_BRANCH[hanja2[1]] ?? hanja2[1];
  return stem + branch;
}

// ---------------------------------------------------------------------------
// 십성 (十星)
// ---------------------------------------------------------------------------

export type Sipsin =
  | "비견" | "겁재"
  | "식신" | "상관"
  | "편재" | "정재"
  | "편관" | "정관"
  | "편인" | "정인";

const STEM_YINYANG: Record<string, 0 | 1> = {
  갑: 0, 을: 1, 병: 0, 정: 1, 무: 0, 기: 1, 경: 0, 신: 1, 임: 0, 계: 1,
}; // 0=양, 1=음

/** 일간 기준 다른 천간의 십성 */
export function getSipsin(dayStem: string, targetStem: string): Sipsin {
  const me = STEM_OHENG[dayStem];
  const other = STEM_OHENG[targetStem];
  const sameYinYang = STEM_YINYANG[dayStem] === STEM_YINYANG[targetStem];

  // 같은 오행: 비견(같은 음양) / 겁재(다른 음양)
  if (me === other) return sameYinYang ? "비견" : "겁재";

  // 내가 생하는 오행 (식상): 목→화→토→금→수→목
  const generates: Record<Oheng, Oheng> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  if (generates[me] === other) return sameYinYang ? "식신" : "상관";

  // 내가 극하는 오행 (재성): 목→토→수→화→금→목
  const controls: Record<Oheng, Oheng> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };
  if (controls[me] === other) return sameYinYang ? "편재" : "정재";

  // 나를 극하는 오행 (관성)
  if (controls[other] === me) return sameYinYang ? "편관" : "정관";

  // 나를 생하는 오행 (인성)
  return sameYinYang ? "편인" : "정인";
}

// ---------------------------------------------------------------------------
// 메인 계산
// ---------------------------------------------------------------------------

function toPillar(hanja2: string): Pillar {
  const stem = HANJA_STEM[hanja2[0]] ?? hanja2[0];
  const branch = HANJA_BRANCH[hanja2[1]] ?? hanja2[1];
  return { stem, branch, hanja: hanja2, korean: stem + branch };
}

/**
 * 생년월일시 → 사주팔자
 *
 * 연주: 입춘 기준 / 월주: 12절기 기준 / 일주: 60갑자 연속 / 시주: 일간+시간 표준표
 * (lunar-typescript의 EightChar가 이 규칙을 따름 — 경계값 검증 완료)
 */
export function calcSaju(input: SajuInput): SajuResult {
  let { year, month, day } = input;
  const hour = input.hour ?? -1;

  // 음력 입력이면 양력으로 변환 (KARI 표준)
  if (input.isLunar) {
    const klc = new KoreanLunarCalendar();
    const ok = klc.setLunarDate(year, month, day, !!input.isLeapMonth);
    if (!ok) throw new Error("유효하지 않은 음력 날짜입니다.");
    const solar = klc.getSolarCalendar();
    year = solar.year;
    month = solar.month;
    day = solar.day;
  }

  // 시간 미상이면 시주는 정오 기준으로 계산하되 null로 반환 (표시하지 않음)
  const solar = Solar.fromYmdHms(year, month, day, hour >= 0 ? hour : 12, 0, 0);
  const ec = solar.getLunar().getEightChar();

  const yearP = toPillar(ec.getYear());
  const monthP = toPillar(ec.getMonth());
  const dayP = toPillar(ec.getDay());
  const timeP = hour >= 0 ? toPillar(ec.getTime()) : null;

  // 오행 분포
  const fiveElements: Record<Oheng, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const pillars = [yearP, monthP, dayP, ...(timeP ? [timeP] : [])];
  for (const p of pillars) {
    fiveElements[STEM_OHENG[p.stem]]++;
    fiveElements[BRANCH_OHENG[p.branch]]++;
  }

  return {
    year: yearP,
    month: monthP,
    day: dayP,
    time: timeP,
    dayStem: dayP.stem,
    fiveElements,
  };
}

/** 각 기둥 천간의 십성 (일간 기준) */
export function getPillarsSipsin(result: SajuResult): Record<"year" | "month" | "day" | "time", Sipsin | null> {
  return {
    year: getSipsin(result.dayStem, result.year.stem),
    month: getSipsin(result.dayStem, result.month.stem),
    day: "비견", // 일간 자신
    time: result.time ? getSipsin(result.dayStem, result.time.stem) : null,
  };
}
