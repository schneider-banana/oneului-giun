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

/** 대운 십성별 풀이 (세련된 반말 버전) */
const DAEYUN_TEXT: Record<Sipsin, string> = {
  비견: "너와 같은 기운이 10년을 지배한다. 독립심이 폭발하고 '내가 직접'이라는 말이 입에 붙는다. 경쟁자도 생기지만, 그 경쟁이 너를 벼랑 끝이 아니라 정상으로 밀어 올린다. 좋은 파트너 한 명이면 이 10년은 혼자보다 세 배로 커진다.",
  겁재: "재물이 옆으로 새는 10년. 대신 사람이 모인다. 투자와 보증 앞에서는 손을 뒤로 묶어두자. 베푼 만큼 인맥으로 돌아오니, '잃었다' 싶을 땐 통장이 아니라 사람 장부를 봐라. 지키는 운으로 가면 탈이 없다.",
  식신: "먹고사는 걱정에서 해방되는 10년. 배가 부르면 마음도 넉넉해진다. 자식 복, 후배 복도 따르니 베풀며 살면 복이 복을 낳는다. 단, 편안함에 취해 몸을 방치하면 나중에 이자까지 내야 한다.",
  상관: "재능이 용솟음치는 10년. 남들이 '저 사람 뭐지?' 하고 돌아보는 시기가 온다. 표현하고, 만들고, 도전하라. 다만 혀가 재주보다 빠르면 그게 바로 구설. 입단속만 잘하면 최고의 10년이다.",
  편재: "발로 뛰는 만큼 쌓이는 10년. 책상 앞보다 현장에서 돈이 보인다. 사업, 영업, 유통. 밖으로 돌수록 기회가 커진다. 흐름이 좋다고 무리수를 두면 한 번에 무너지니, '딱 내 몫'이라는 선을 잊지 말자.",
  정재: "땀의 대가를 차곡차곡 받는 10년. 월급쟁이는 목돈을, 사업가는 기반을 만든다. 부동산 같은 실물 자산에 길하니, 종잣돈을 모으기에 이만한 시기가 없다. 성실함이 복리로 불어난다.",
  편관: "시험대에 오르는 10년. 직장에서는 책임이, 인생에서는 시련이 무게를 더한다. 버티는 게 이기는 게임. 밤을 새운 만큼 위치가 올라간다. 단, 몸을 갈아 넣으면 건강이 먼저 항복하니 관리가 필수다.",
  정관: "이름값이 오르는 10년. 승진, 합격, 인정. 바른 길로 가면 귀인이 알아서 문을 열어준다. 원칙을 지킨 사람에게 세상은 생각보다 관대하다. 이 시기에 쌓은 평판은 평생 간다.",
  편인: "속이 깊어지는 10년. 시끄러운 성공보다 조용한 깨달음이 값지다. 학문, 연구, 수행에 길하고 직감이 예리해져서 '느낌'이 자주 맞는다. 고독을 즐길 줄 알면 이 10년은 수행이 아니라 축복이다.",
  정인: "배우고 베푸는 10년. 문서운, 자격운, 학업운이 트이고 엄마와 스승의 덕을 본다. 가르치는 자리에 서면 제자가 따르고, 배우는 자리에 앉으면 스승이 나타난다. 씨앗을 뿌리는 시기. 수확은 다음 대운에.",
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
