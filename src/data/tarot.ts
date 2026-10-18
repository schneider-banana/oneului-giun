/**
 * 타로 메이저 아르카나 22장 (번들 데이터)
 * 세련된 반말 (뉴닉 스타일). 매일 1장 뽑기용.
 */

export interface TarotCard {
  /** 카드 번호 */
  no: number;
  /** 한글 이름 */
  name: string;
  /** 영문 이름 */
  nameEn: string;
  /** 키워드 */
  keyword: string;
  /** 정방향 해석 */
  upright: { love: string; money: string; advice: string };
  /** 역방향 해석 */
  reversed: { love: string; money: string; advice: string };
}

export const TAROT_DECK: TarotCard[] = [
  {
    no: 0,
    name: "광대",
    nameEn: "The Fool",
    keyword: "새로운 시작",
    upright: {
      love: "썸 타기 딱 좋은 날이야. 가벼운 마음으로 다가가봐. 계산하지 말고 일단 직진.",
      money: "새로운 시도를 해볼 때야. 작은 금액으로 시작하는 사이드 프로젝트가 의외로 잘 풀려.",
      advice: "완벽한 타이밍은 없어. 일단 시작하는 게 오늘의 정답이야.",
    },
    reversed: {
      love: "너무 앞서가지 마. 상대 속도를 안 맞추면 혼자 달리는 꼴이 돼.",
      money: "충동 지출 주의보. 장바구니에 담아둔 건 오늘은 결제하지 마.",
      advice: "멈춰서 한 번만 더 생각해봐. 오늘의 실수는 대충 넘기면 커져.",
    },
  },
  {
    no: 1,
    name: "마법사",
    nameEn: "The Magician",
    keyword: "능력과 실행",
    upright: {
      love: "네 매력이 풀가동되는 날이야. 하고 싶은 말이 있으면 오늘이 기회야.",
      money: "네 손에 이미 카드가 다 있어. 망설이지 말고 실행에 옮겨.",
      advice: "준비는 끝났어. 이제 보여줄 시간이야.",
    },
    reversed: {
      love: "말만 번지르르하면 역효과야. 행동으로 보여줘.",
      money: "실력보다 포장에 의존하고 있지 않아? 본질을 점검해봐.",
      advice: "재능을 아끼지 마. 근데 허세는 금물이야.",
    },
  },
  {
    no: 2,
    name: "여사제",
    nameEn: "The High Priestess",
    keyword: "직관과 비밀",
    upright: {
      love: "촉이 맞는 날이야. 뭔가 쎄하다 싶으면 그 느낌이 맞아.",
      money: "남들이 모르는 정보를 캐치할 수 있어. 귀를 열어둬.",
      advice: "답은 이미 네 안에 있어. 조용히 귀 기울여봐.",
    },
    reversed: {
      love: "감정에 휘둘려서 사실을 못 보고 있어. 한 발짝 물러나.",
      money: "숨겨진 조건이 있을 수 있어. 계약서는 두 번 읽어.",
      advice: "직관을 무시하지 마. 근데 불안과 직관은 구분해야 해.",
    },
  },
  {
    no: 3,
    name: "여황제",
    nameEn: "The Empress",
    keyword: "풍요와 안정",
    upright: {
      love: "따뜻하게 대해주면 두 배로 돌아와. 오늘은 베푸는 날이야.",
      money: "수입운이 좋아. 들어오는 돈은 잘 굴리면 불어날 자리야.",
      advice: "여유를 가져. 조급함이 오늘의 유일한 적이야.",
    },
    reversed: {
      love: "주는 것만 하지 말고 받는 것도 연습해. 일방통행은 지쳐.",
      money: "지출이 수입을 앞지르고 있어. 가계부 한 번 펼쳐봐.",
      advice: "네 것도 챙겨. 남 챙기다 너까지 무너지면 안 되잖아.",
    },
  },
  {
    no: 4,
    name: "황제",
    nameEn: "The Emperor",
    keyword: "통제와 리더십",
    upright: {
      love: "리드를 잡아도 되는 날이야. 데이트 코스 네가 정해봐.",
      money: "체계적으로 굴리면 돈이 모여. 예산 세우기 딱 좋은 날.",
      advice: "흔들리지 마. 네 기준이 오늘의 나침반이야.",
    },
    reversed: {
      love: "컨트롤하려 들면 멀어져. 상대도 어른이야.",
      money: "고집부리다 놓치는 게 있어. 유연하게 대처해.",
      advice: "다 통제할 순 없어. 놓을 건 놓는 것도 실력이야.",
    },
  },
  {
    no: 5,
    name: "교황",
    nameEn: "The Hierophant",
    keyword: "전통과 조언",
    upright: {
      love: "주변 어른이나 친구의 조언이 의외로 들어맞아. 들어봐.",
      money: "정석대로 가는 게 답이야. 꼼수 부리지 마.",
      advice: "기본으로 돌아가. 클래식이 괜히 클래식이 아냐.",
    },
    reversed: {
      love: "남들 눈치 보느라 네 마음을 속이지 마.",
      money: "관행이라고 다 맞는 건 아니야. 의심해볼 건 해봐.",
      advice: "틀을 깨도 돼. 오늘은 반항이 약이야.",
    },
  },
  {
    no: 6,
    name: "연인",
    nameEn: "The Lovers",
    keyword: "선택과 인연",
    upright: {
      love: "인연운 최상이야. 솔로면 나가봐. 커플이면 깊은 대화를.",
      money: "파트너십이 빛나는 날. 협업 제안이 오면 받아들여.",
      advice: "마음이 가는 쪽을 골라. 머리로 재면 후회해.",
    },
    reversed: {
      love: "가치관이 안 맞으면 억지로 맞추지 마. 삐걱거리는 건 신호야.",
      money: "동업 조건을 다시 봐. 말로만 한 약속은 위험해.",
      advice: "선택의 순간이야. 미루면 둘 다 놓쳐.",
    },
  },
  {
    no: 7,
    name: "전차",
    nameEn: "The Chariot",
    keyword: "돌진과 승리",
    upright: {
      love: "밀당 끝. 오늘은 확실하게 마음을 보여줘.",
      money: "추진력이 붙는 날이야. 미뤄둔 일을 오늘 끝내.",
      advice: "앞만 보고 달려. 뒤돌아볼 시간에 한 걸음 더.",
    },
    reversed: {
      love: "너무 밀어붙이면 상대가 지쳐. 속도 조절이 필요해.",
      money: "방향을 잘못 잡았을 수 있어. 지도를 다시 펼쳐.",
      advice: "브레이크도 운전 실력이야. 오늘은 잠깐 쉬어가.",
    },
  },
  {
    no: 8,
    name: "힘",
    nameEn: "Strength",
    keyword: "인내와 용기",
    upright: {
      love: "부드러움이 가장 센 무기야. 다그치지 말고 기다려줘.",
      money: "버티는 게 이기는 거야. 지금 포기하면 다 물거품.",
      advice: "너 생각보다 강해. 오늘 그걸 증명할 일이 생길 거야.",
    },
    reversed: {
      love: "지쳤으면 지쳤다고 말해. 참는 게 미덕은 아니야.",
      money: "무리한 버티기는 손해야. 손절도 전략이야.",
      advice: "쉬어도 돼. 충전 없이 달리면 방전돼.",
    },
  },
  {
    no: 9,
    name: "은둔자",
    nameEn: "The Hermit",
    keyword: "성찰과 휴식",
    upright: {
      love: "혼자만의 시간이 필요해. 그게 상대를 밀어내는 게 아니라는 걸 알려줘.",
      money: "조용히 공부하고 준비하는 날. 내일의 네가 고마워할 거야.",
      advice: "소음을 끄고 네 속도에 집중해.",
    },
    reversed: {
      love: "너무 혼자 있지 마. 문을 닫으면 아무도 못 들어와.",
      money: "정보가 부족해. 밖에 나가서 사람을 만나봐.",
      advice: "고립과 휴식은 달라. 오늘은 나가봐.",
    },
  },
  {
    no: 10,
    name: "운명의 수레바퀴",
    nameEn: "Wheel of Fortune",
    keyword: "전환점",
    upright: {
      love: "흐름이 바뀌는 날이야. 정체됐던 관계에 바람이 불어.",
      money: "운이 트이는 시점이야. 기다리던 소식이 올 수 있어.",
      advice: "바뀌는 걸 두려워 마. 이번 변화는 네 편이야.",
    },
    reversed: {
      love: "타이밍이 안 맞는 날이야. 무리하게 밀어붙이지 마.",
      money: "예상 밖 변수가 생길 수 있어. 플랜 B를 준비해둬.",
      advice: "운이 없다고 좌절하지 마. 바퀴는 계속 돌아가니까.",
    },
  },
  {
    no: 11,
    name: "정의",
    nameEn: "Justice",
    keyword: "균형과 진실",
    upright: {
      love: "공평하게 대하면 관계가 단단해져. 숨기는 거 없이 솔직하게.",
      money: "정당한 대가를 받을 때야. 받을 건 확실히 받아.",
      advice: "진실이 네 편이야. 당당하게 굴어.",
    },
    reversed: {
      love: "한쪽으로 치우친 건 없어? 네 입장만 고집하고 있지 않아?",
      money: "불공정한 조건에 서명하지 마. 꼼꼼히 따져봐.",
      advice: "결과에 승복해. 변명보다 다음이 중요해.",
    },
  },
  {
    no: 12,
    name: "매달린 사람",
    nameEn: "The Hanged Man",
    keyword: "관점 전환",
    upright: {
      love: "상대 입장에서 한 번 봐. 세상이 다르게 보여.",
      money: "지금은 기다림의 시간이야. 서두르면 손해야.",
      advice: "잠깐 멈추는 게 지는 게 아니야. 보는 눈이 달라질 거야.",
    },
    reversed: {
      love: "희생만 하고 있지 않아? 관계는 혼자 지탱하는 게 아냐.",
      money: "미루기만 하다 기회를 놓치고 있어. 데드라인을 정해.",
      advice: "기다림에도 유통기한이 있어.",
    },
  },
  {
    no: 13,
    name: "죽음",
    nameEn: "Death",
    keyword: "끝과 새 출발",
    upright: {
      love: "끝낼 건 끝내. 그래야 새로운 인연이 들어올 자리가 생겨.",
      money: "안 되는 건 정리해. 미련이 제일 비싼 비용이야.",
      advice: "끝은 시작의 다른 이름이야. 가볍게 털어.",
    },
    reversed: {
      love: "끝난 줄 알았는데 미련이 남았어? 마무리가 안 된 거야.",
      money: "변화를 거부하면 더 아파. 흐름에 몸을 맡겨.",
      advice: "놓지 못하는 게 뭔지 정직하게 봐.",
    },
  },
  {
    no: 14,
    name: "절제",
    nameEn: "Temperance",
    keyword: "조화와 절제",
    upright: {
      love: "적당한 거리가 오히려 설레게 해. 너무 들이대지 마.",
      money: "분산이 답이야. 한 곳에 몰빵하지 마.",
      advice: "균형 잡힌 하루를 보내. 극단은 피하는 게 좋아.",
    },
    reversed: {
      love: "감정 기복이 심해. 말하기 전에 세 번 생각해.",
      money: "과소비 패턴이 보여. 오늘은 지갑을 닫아.",
      advice: "중용이 어려우면 일단 멈춰. 그게 제일 안전해.",
    },
  },
  {
    no: 15,
    name: "악마",
    nameEn: "The Devil",
    keyword: "집착과 유혹",
    upright: {
      love: "끌림이 강렬한 날이야. 근데 그게 사랑인지 집착인지 구분해.",
      money: "달콤한 제안 뒤에 조건이 숨어있어. 현혹되지 마.",
      advice: "유혹은 알아차리는 순간 힘이 빠져. 직시해.",
    },
    reversed: {
      love: "집착에서 벗어날 타이밍이야. 놔주면 네가 편해져.",
      money: "나쁜 습관에서 벗어날 수 있어. 오늘부터 끊어봐.",
      advice: "사슬은 네가 풀 수 있어. 생각보다 묶인 게 아니야.",
    },
  },
  {
    no: 16,
    name: "탑",
    nameEn: "The Tower",
    keyword: "급변과 충격",
    upright: {
      love: "예상 못한 일이 터질 수 있어. 당황하지 말고 받아들여.",
      money: "계획이 틀어질 수 있어. 비상금을 점검해둬.",
      advice: "무너지는 건 낡은 거야. 새로 지을 기회로 봐.",
    },
    reversed: {
      love: "위기는 넘겼어. 이제 복구할 시간이야.",
      money: "최악은 피했어. 작은 손해로 막은 걸 다행으로 여겨.",
      advice: "폭풍 뒤엔 맑아져. 조금만 버텨.",
    },
  },
  {
    no: 17,
    name: "별",
    nameEn: "The Star",
    keyword: "희망과 치유",
    upright: {
      love: "설렘이 돌아오는 날이야. 마음이 통하는 순간이 있을 거야.",
      money: "막혔던 게 풀려. 희망을 가져도 되는 타이밍이야.",
      advice: "잘하고 있어. 조금만 더 가면 돼.",
    },
    reversed: {
      love: "기대에 못 미쳐서 실망했어? 그래도 완전히 끝난 건 아냐.",
      money: "희망 회로만 돌리지 마. 현실 점검이 필요해.",
      advice: "지쳤으면 쉬어. 별은 기다려주니까.",
    },
  },
  {
    no: 18,
    name: "달",
    nameEn: "The Moon",
    keyword: "불안과 착각",
    upright: {
      love: "확실하지 않은 게 있어. 섣불리 결론 내리지 마.",
      money: "정보가 흐릿해. 큰 결정은 내일로 미뤄.",
      advice: "불안은 그림자야. 실체가 아닐 수 있어.",
    },
    reversed: {
      love: "오해가 풀리는 날이야. 대화로 확인해봐.",
      money: "안개가 걷히고 있어. 곧 판단이 설 거야.",
      advice: "두려웠던 게 별거 아니었네 할 날이 와.",
    },
  },
  {
    no: 19,
    name: "태양",
    nameEn: "The Sun",
    keyword: "성공과 기쁨",
    upright: {
      love: "최고의 날이야. 고백, 데이트, 프러포즈 다 돼.",
      money: "재물운 만개. 자신 있게 밀어붙여.",
      advice: "오늘은 네 날이야. 마음껏 즐겨.",
    },
    reversed: {
      love: "좋은 흐름인데 네가 못 믿고 있어. 자신감을 가져.",
      money: "성과가 늦어지고 있어도 방향은 맞아. 조급해하지 마.",
      advice: "구름 뒤에도 태양은 있어. 곧 드러나.",
    },
  },
  {
    no: 20,
    name: "심판",
    nameEn: "Judgement",
    keyword: "각성과 결단",
    upright: {
      love: "재회운이 있어. 끝난 인연에서 연락이 올 수 있어.",
      money: "과거의 노력이 결실을 맺어. 뿌린 걸 거둘 때야.",
      advice: "결단의 시간이야. 미루던 걸 오늘 끝내.",
    },
    reversed: {
      love: "과거에 발목 잡히지 마. 앞으로 가야 해.",
      money: "자책은 그만. 이미 지난 일에 이자까지 내지 마.",
      advice: "네 자신을 용서해. 그게 먼저야.",
    },
  },
  {
    no: 21,
    name: "세계",
    nameEn: "The World",
    keyword: "완성과 성취",
    upright: {
      love: "관계가 한 단계 성숙해져. 안정감이 느껴질 거야.",
      money: "마무리 짓기 좋은 날이야. 완성하고 다음으로.",
      advice: "수고했어. 오늘은 스스로를 칭찬해줘.",
    },
    reversed: {
      love: "뭔가 덜 끝난 느낌이야. 마무리를 확실히 해.",
      money: "마지막 1%가 안 돼서 답답해? 조금만 더.",
      advice: "완벽하지 않아도 돼. 일단 매듭을 지어.",
    },
  },
];

/** 결정적 해시 */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export interface TarotDraw {
  card: TarotCard;
  /** 정방향 여부 */
  upright: boolean;
  /** YYYY-MM-DD */
  date: string;
}

/** 오늘의 타로 1장 뽑기 (같은 날 같은 프로필 → 같은 카드) */
export function drawDailyTarot(profileId: string, now: Date = new Date()): TarotDraw {
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const seed = hash(`${profileId}|${date}`);
  const card = TAROT_DECK[seed % TAROT_DECK.length];
  const upright = seed % 3 !== 0; // 약 2/3 확률로 정방향
  return { card, upright, date };
}

/** 추가 뽑기 (유료/VIP용 — 시드 salt로 다른 카드) */
export function drawExtraTarot(profileId: string, salt: string): TarotDraw {
  const seed = hash(`${profileId}|extra|${salt}|${Date.now()}`);
  const card = TAROT_DECK[seed % TAROT_DECK.length];
  const upright = seed % 3 !== 0;
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return { card, upright, date };
}
