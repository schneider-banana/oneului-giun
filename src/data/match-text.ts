/**
 * 궁합 분야별 풀이 텍스트 (세련된 반말)
 * 밴드: high(75점 이상) / mid(50~74점) / low(50점 미만), 각 2개 variant
 */

export type MatchBand = "high" | "mid" | "low";

export function scoreToBand(score: number): MatchBand {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

export interface MatchFieldText {
  field: "personality" | "communication" | "money";
  label: string;
  icon: "favorite" | "chat" | "payments";
  texts: Record<MatchBand, string[]>;
}

export const MATCH_FIELDS: MatchFieldText[] = [
  {
    field: "personality",
    label: "성격 궁합",
    icon: "favorite",
    texts: {
      high: [
        "성격 케미가 좋다. 서로의 다름이 매력으로 보인다. 티격태격해도 금방 풀리는 사이다.",
        "같이 있으면 편하다. 억지로 맞추지 않아도 리듬이 맞는다. 오래 갈 상이다.",
      ],
      mid: [
        "성격은 무난하다. 크게 안 맞지도, 찰떡도 아니다. 서로 배려하면 충분히 좋아진다.",
        "다름이 약간 있다. 그 다름을 인정하면 시너지, 아니면 잔소리가 된다.",
      ],
      low: [
        "성격 충돌 주의. 서로 고집이 셀 수 있다. 한 발씩 물러서는 연습이 필요하다.",
        "부딪히는 지점이 있다. 참는 게 아니라 대화로 풀어라. 쌓이면 터진다.",
      ],
    },
  },
  {
    field: "communication",
    label: "소통 궁합",
    icon: "chat",
    texts: {
      high: [
        "대화가 잘 통한다. 말 안 해도 아는 사이가 될 수 있다. 연락 템포도 잘 맞는다.",
        "소통이 원활하다. 오해가 생겨도 금방 풀린다. 대화가 많은 사이가 오래 간다.",
      ],
      mid: [
        "소통은 보통이다. 가끔 엇갈릴 때가 있다. 그럴 땐 직접 만나서 얘기해라.",
        "말은 통하는데 깊이가 아쉬울 수 있다. 진심을 꺼내는 연습을 해보자.",
      ],
      low: [
        "소통 주의보. 말은 했는데 전달이 안 될 때가 많다. 중요한 얘기는 얼굴 보고 해라.",
        "오해가 쌓이기 쉽다. 알겠지라고 넘기지 마라. 확인하고 또 확인해라.",
      ],
    },
  },
  {
    field: "money",
    label: "금전 궁합",
    icon: "payments",
    texts: {
      high: [
        "금전 궁합이 좋다. 돈 관리 스타일이 잘 맞는다. 함께 모으면 불어난다.",
        "돈으로 싸울 일이 적다. 가치관이 비슷해서 지출 우선순위가 맞는다.",
      ],
      mid: [
        "금전은 무난하다. 한 명은 모으고 한 명은 쓰는 스타일일 수 있다. 역할 분담을 정해라.",
        "돈 얘기는 미리 해두는 게 좋다. 나중에 터지면 크게 터진다.",
      ],
      low: [
        "금전관 충돌 주의. 쓰는 스타일이 다를 수 있다. 공동 지출 규칙을 정해라.",
        "돈 때문에 서운해질 수 있다. 투명하게 공유하고, 각자 용돈은 따로 가져가라.",
      ],
    },
  },
];

/** 총평 */
export const MATCH_VERDICT: Record<MatchBand, string[]> = {
  high: [
    "잘 맞는 인연이다. 서로를 아끼면 오래 간다.",
    "케미가 좋은 사이다. 이 인연은 붙잡을 만하다.",
  ],
  mid: [
    "노력하면 좋아지는 인연이다. 대화가 답이다.",
    "무난하게 갈 수 있는 사이다. 배려가 포인트다.",
  ],
  low: [
    "부딪힐 수 있는 인연이다. 이해와 배려가 필수다.",
    "노력이 많이 필요한 사이다. 그래도 마음이 있으면 된다.",
  ],
};
