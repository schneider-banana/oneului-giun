/**
 * 평생운 — 대운(10년 주기) + 세운(올해 운)
 * lunar-typescript의 getYun()을 사용한다.
 * gender: 1 = 남, 0 = 여
 */
import { Solar } from "lunar-typescript";
import { getSipsin, hanjaToKorean, Sipsin } from "./saju";

export interface Daeyun {
  /** 시작 나이 */
  startAge: number;
  /** 끝 나이 */
  endAge: number;
  /** 시작 연도 */
  startYear: number;
  /** 끝 연도 */
  endYear: number;
  /** 간지 */
  ganZhi: { hanja: string; korean: string };
  /** 천간 십성 (일간 기준) */
  sipsin: Sipsin;
  /** 현재 대운 여부 */
  isCurrent: boolean;
  /** 풀이 */
  text: string;
}

export interface Seyun {
  /** 연도 */
  year: number;
  /** 세운 간지 */
  ganZhi: { hanja: string; korean: string };
  /** 천간 십성 */
  sipsin: Sipsin;
  /** 풀이 */
  text: string;
}

/** 대운 십성별 풀이 */
const DAEYUN_TEXT: Record<Sipsin, string> = {
  비견: "나와 같은 기운의 10년. 독립심이 강해지고 경쟁이 따릅니다. 협력자를 잘 두면 크게 성장하는 시기입니다.",
  겁재: "재물을 나누는 10년. 투자·보증은 신중히, 대신 인맥은 넓어집니다. 지키는 운으로 가면 탈이 없습니다.",
  식신: "먹고사는 복이 따르는 10년. 여유롭고 풍요로우며, 자식·후배 복도 있습니다. 즐기면서도 건강은 챙기세요.",
  상관: "재능을 펼치는 10년. 표현·창작·도전하는 일에서 두각을 나타냅니다. 다만 언행이 거칠어지면 구설을 부릅니다.",
  편재: "활동적으로 재물을 모으는 10년. 사업·영업·유통에 길하고, 밖으로 돌수록 기회가 커집니다.",
  정재: "성실히 모으는 10년. 월급·사업 기반이 탄탄해지고, 부동산 등 실물 자산에 길합니다.",
  편관: "긴장과 압박의 10년. 직장·조직에서 시험받는 시기지만, 버티면 위치가 올라갑니다. 건강 관리 필수.",
  정관: "명예와 지위가 오르는 10년. 승진·합격·인정에 길하고, 바른 길로 가면 귀인이 돕습니다.",
  편인: "생각이 깊어지는 10년. 학문·연구·수행에 길하고, 직감이 예리해집니다. 고독을 즐길 줄 알면 복입니다.",
  정인: "배우고 베푸는 10년. 문서·자격·학업운이 좋고, 어머니·스승의 덕을 봅니다. 가르치는 일에도 길합니다.",
};

export function calcDaeyun(
  birthY: number,
  birthM: number,
  birthD: number,
  birthH: number,
  gender: 1 | 0,
  dayStemKorean: string
): Daeyun[] {
  const hour = birthH < 0 ? 12 : birthH;
  const solar = Solar.fromYmdHms(birthY, birthM, birthD, hour, 0, 0);
  const eight = solar.getLunar().getEightChar();
  const yun = eight.getYun(gender);
  const list = yun.getDaYun();
  const nowYear = new Date().getFullYear();

  return list
    .filter((d) => d.getGanZhi() !== "")
    .map((d) => {
      const gz = d.getGanZhi();
      const ko = hanjaToKorean(gz);
      const sipsin = getSipsin(dayStemKorean, ko[0]);
      return {
        startAge: d.getStartAge(),
        endAge: d.getEndAge(),
        startYear: d.getStartYear(),
        endYear: d.getEndYear(),
        ganZhi: { hanja: gz, korean: ko },
        sipsin,
        isCurrent: nowYear >= d.getStartYear() && nowYear <= d.getEndYear(),
        text: DAEYUN_TEXT[sipsin],
      };
    });
}

/** 올해 세운 */
export function calcSeyun(
  dayStemKorean: string,
  year: number = new Date().getFullYear()
): Seyun {
  const solar = Solar.fromYmd(year, 6, 15); // 연주만 필요
  const gz = solar.getLunar().getEightChar().getYear(); // 한자 연주
  const ko = hanjaToKorean(gz);
  const sipsin = getSipsin(dayStemKorean, ko[0]);
  return {
    year,
    ganZhi: { hanja: gz, korean: ko },
    sipsin,
    text: DAEYUN_TEXT[sipsin].replace(/10년/g, "한 해"),
  };
}
