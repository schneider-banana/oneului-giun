import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, ohengColors, radius } from "../src/theme";
import { calcSaju, getPillarsSipsin, Pillar, Oheng } from "../src/lib/saju";
import { calcDailyFortune } from "../src/lib/fortune";
import { calcTojeong } from "../src/lib/tojeong";
import { calcDaeyun, calcSeyun } from "../src/lib/daeun";

const PILLAR_LABELS = ["시", "일", "월", "년"] as const;
const TABS = ["오늘의 운세", "토정비결", "평생운", "사주팔자"] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// 사주팔자 탭
// ---------------------------------------------------------------------------
function PillarCard({ label, pillar, sipsin }: { label: string; pillar: Pillar | null; sipsin: string | null }) {
  if (!pillar) {
    return (
      <View style={[styles.pillar, styles.pillarEmpty]}>
        <Text style={styles.pillarLabel}>{label}주</Text>
        <Text style={styles.emptyText}>미상</Text>
      </View>
    );
  }
  return (
    <View style={styles.pillar}>
      <Text style={styles.pillarLabel}>{label}주</Text>
      <Text style={styles.hanja}>{pillar.hanja[0]}</Text>
      <Text style={styles.hanja}>{pillar.hanja[1]}</Text>
      <Text style={styles.korean}>{pillar.korean}</Text>
      {sipsin && <Text style={styles.sipsin}>{sipsin}</Text>}
    </View>
  );
}

function SajuTab({ input }: { input: any }) {
  const result = useMemo(() => calcSaju(input), [input]);
  const sipsin = useMemo(() => getPillarsSipsin(result), [result]);
  const pillars: (Pillar | null)[] = [result.time, result.day, result.month, result.year];
  const sipsins: (string | null)[] = [sipsin.time, sipsin.day, sipsin.month, sipsin.year];
  const total = Object.values(result.fiveElements).reduce((a, b) => a + b, 0);

  return (
    <View>
      <Text style={styles.title}>사주팔자</Text>
      <Text style={styles.subtitle}>
        {input.profileName ? `${input.profileName} · ` : ""}
        {input.year}년 {input.month}월 {input.day}일 {input.isLunar ? "(음력)" : "(양력)"}
        {input.hour >= 0 ? ` ${input.hour}시` : " 시간 미상"} · {input.gender === 1 ? "남" : "여"}
      </Text>
      <View style={styles.row}>
        {pillars.map((p, i) => (
          <PillarCard key={PILLAR_LABELS[i]} label={PILLAR_LABELS[i]} pillar={p} sipsin={sipsins[i]} />
        ))}
      </View>
      <Text style={styles.sectionTitle}>오행 분포</Text>
      <View style={styles.card}>
        {(Object.keys(result.fiveElements) as Oheng[]).map((o) => {
          const count = result.fiveElements[o];
          return (
            <View key={o} style={styles.ohengRow}>
              <Text style={[styles.ohengLabel, { color: ohengColors[o] }]}>{o}</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(count / Math.max(total, 1)) * 100}%`, backgroundColor: ohengColors[o] },
                  ]}
                />
              </View>
              <Text style={styles.ohengCount}>{count}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>일간 — {result.dayStem}</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          일간은 '나 자신'을 뜻한다. {result.dayStem}일간의 진짜 성격 풀이는 정통사주
          리포트에서 확인하자. (준비 중)
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 오늘의 운세 탭
// ---------------------------------------------------------------------------
const LUCKY_COLOR_HEX: Record<string, string> = {
  초록: "#2E9E5B",
  빨강: "#E5484D",
  노랑: "#E5A50A",
  흰색: "#FFFFFF",
  검정: "#332E29",
};

const CATEGORY_META = [
  { key: "total", label: "총운", icon: "wb-sunny" as const, tint: "#FFF1E2", iconColor: "#D96C1E" },
  { key: "love", label: "애정운", icon: "favorite" as const, tint: "#FFE0E8", iconColor: "#E5484D" },
  { key: "money", label: "재물운", icon: "payments" as const, tint: "#DCF3E4", iconColor: "#2E9E5B" },
  { key: "health", label: "건강운", icon: "spa" as const, tint: "#E1E9FB", iconColor: "#3B82F6" },
];

function ScoreRing({ score }: { score: number }) {
  const size = 148;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(1, Math.max(0, score / 100));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8C42" />
            <Stop offset="1" stopColor="#D96C1E" />
          </SvgGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} stroke="#F3E4CE" strokeWidth={stroke} fill="none" />
        <Circle
          cx={c} cy={c} r={r}
          stroke="url(#scoreGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ * progress} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.ringScore}>{score}</Text>
        <Text style={styles.ringUnit}>점</Text>
      </View>
    </View>
  );
}

function DailyTab({ input }: { input: any }) {
  const fortune = useMemo(() => {
    const r = calcSaju(input);
    return calcDailyFortune(input.year, input.month, input.day, r.dayStem);
  }, [input]);

  const categories = CATEGORY_META.map((m) => ({
    ...m,
    text: fortune.text[m.key as keyof typeof fortune.text],
  }));

  const luckyItems = [
    { icon: "palette" as const, label: "행운의 색", value: fortune.luckyColor, swatch: LUCKY_COLOR_HEX[fortune.luckyColor] ?? colors.primary },
    { icon: "tag" as const, label: "행운의 숫자", value: String(fortune.luckyNumber) },
    { icon: "explore" as const, label: "행운의 방향", value: fortune.luckyDirection },
  ];

  return (
    <View>
      <LinearGradient colors={["#FFE7C9", "#FFF6E9"]} style={styles.heroCard}>
        <Text style={styles.heroDate}>{fortune.dateLabel}</Text>
        <Text style={styles.heroIljin}>일진 {fortune.dayPillar.korean}({fortune.dayPillar.hanja})</Text>
        <View style={{ marginVertical: 12 }}>
          <ScoreRing score={fortune.score} />
        </View>
        <View style={styles.sipsinBadge}>
          <Text style={styles.sipsinBadgeText}>{fortune.sipsin}의 날</Text>
        </View>
      </LinearGradient>

      {categories.map((cat) => (
        <View key={cat.label} style={styles.catCard}>
          <View style={[styles.catIcon, { backgroundColor: cat.tint }]}>
            <MaterialIcons name={cat.icon} size={22} color={cat.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.catLabel}>{cat.label}</Text>
            <Text style={styles.catBody}>{cat.text}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>행운 요소</Text>
      <View style={styles.luckyRow}>
        {luckyItems.map((item) => (
          <View key={item.label} style={styles.luckyChip}>
            <MaterialIcons name={item.icon} size={20} color={colors.primaryDeep} />
            <Text style={styles.luckyLabel}>{item.label}</Text>
            {item.swatch ? (
              <View style={[styles.colorDot, { backgroundColor: item.swatch }]} />
            ) : null}
            <Text style={styles.luckyValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 토정비결 탭
// ---------------------------------------------------------------------------
function TojeongTab({ input }: { input: any }) {
  const [year] = useState(new Date().getFullYear());
  const tj = useMemo(
    () => calcTojeong(input.year, input.month, input.day, input.hour, year),
    [input, year]
  );

  return (
    <View>
      <Text style={styles.title}>{year}년 토정비결</Text>
      <Text style={styles.subtitle}>생년월일시의 수리로 뽑은 올해의 괘</Text>
      <View style={styles.scoreCard}>
        <Text style={styles.guaHanja}>{tj.gua.hanja}</Text>
        <Text style={styles.guaName}>제{tj.gua.no}괘 {tj.gua.name}</Text>
        <Text style={styles.body}>{tj.gua.meaning}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>올해의 조언</Text>
        <Text style={styles.body}>{tj.gua.advice}</Text>
      </View>
      <Text style={styles.sectionTitle}>월별 운세</Text>
      {tj.months.map((m) => (
        <View key={m.month} style={styles.monthRow}>
          <Text style={styles.monthNum}>{m.month}월</Text>
          <Text
            style={[
              styles.monthLevel,
              { color: m.level === "길" ? "#2E9E5B" : m.level === "흉" ? "#E5484D" : colors.textSoft },
            ]}
          >
            {m.level}
          </Text>
          <Text style={styles.monthText}>{m.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 평생운 탭
// ---------------------------------------------------------------------------
function DaeunTab({ input }: { input: any }) {
  const result = useMemo(() => calcSaju(input), [input]);
  const daeyuns = useMemo(
    () => calcDaeyun(input.year, input.month, input.day, input.hour, input.gender ?? 1, result.dayStem),
    [input, result]
  );
  const seyun = useMemo(() => calcSeyun(result.dayStem), [result]);

  return (
    <View>
      <Text style={styles.title}>평생운 · 대운</Text>
      <Text style={styles.subtitle}>10년 주기로 바뀌는 큰 운의 흐름</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {seyun.year}년 세운 — {seyun.ganZhi.korean}({seyun.ganZhi.hanja}) · {seyun.sipsin}
        </Text>
        <Text style={styles.body}>{seyun.text}</Text>
      </View>
      <Text style={styles.sectionTitle}>대운 흐름</Text>
      {daeyuns.map((d) => (
        <View key={d.startAge} style={[styles.card, d.isCurrent && styles.currentCard]}>
          <View style={styles.daeyunHeader}>
            <Text style={styles.daeyunTitle}>
              {d.startAge}–{d.endAge}세 ({d.startYear}–{d.endYear})
            </Text>
            {d.isCurrent && <Text style={styles.nowBadge}>현재</Text>}
          </View>
          <Text style={styles.daeyunGanzhi}>
            {d.ganZhi.korean}({d.ganZhi.hanja}) · {d.sipsin}
          </Text>
          <Text style={styles.body}>{d.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 결과 화면
// ---------------------------------------------------------------------------
export default function ResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const input = JSON.parse(data);
  const [tab, setTab] = useState<Tab>("오늘의 운세");

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === "오늘의 운세" && <DailyTab input={input} />}
        {tab === "토정비결" && <TojeongTab input={input} />}
        {tab === "평생운" && <DaeunTab input={input} />}
        {tab === "사주팔자" && <SajuTab input={input} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: "row", backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.textSoft },
  tabTextActive: { color: colors.primaryDeep, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSoft, marginTop: 4, marginBottom: 16 },
  row: { flexDirection: "row", gap: 8, marginBottom: 20 },
  pillar: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    alignItems: "center", paddingVertical: 14,
  },
  pillarEmpty: { justifyContent: "center", minHeight: 150 },
  pillarLabel: { fontSize: 13, color: colors.textSoft, fontWeight: "600", marginBottom: 8 },
  hanja: { fontSize: 30, fontWeight: "800", color: colors.text, lineHeight: 38 },
  korean: { fontSize: 13, color: colors.textSoft, marginTop: 6 },
  sipsin: {
    fontSize: 12, fontWeight: "700", color: colors.primaryDeep,
    backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.round, marginTop: 6,
  },
  emptyText: { fontSize: 14, color: colors.inactive },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  ohengRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  ohengLabel: { fontSize: 15, fontWeight: "800", width: 24 },
  barBg: { flex: 1, height: 10, backgroundColor: colors.background, borderRadius: 5, marginHorizontal: 10, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
  ohengCount: { fontSize: 14, fontWeight: "700", color: colors.text, width: 16, textAlign: "right" },
  scoreCard: {
    backgroundColor: colors.primarySoft, borderRadius: radius.lg,
    padding: 20, alignItems: "center", marginBottom: 16,
  },
  scoreLabel: { fontSize: 14, color: colors.textSoft, fontWeight: "600" },
  score: { fontSize: 44, fontWeight: "800", color: colors.primaryDeep, marginVertical: 4 },
  sipsinBig: { fontSize: 16, fontWeight: "700", color: colors.text },
  // 오늘의 운세 — 히어로 + 카테고리 + 행운 요소
  heroCard: {
    borderRadius: radius.xl, padding: 20, alignItems: "center",
    marginBottom: 16, borderWidth: 1, borderColor: "#F5DFC0",
  },
  heroDate: { fontSize: 14, fontWeight: "700", color: colors.textSoft },
  heroIljin: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  ringScore: { fontSize: 40, fontWeight: "800", color: colors.text, lineHeight: 44 },
  ringUnit: { fontSize: 14, fontWeight: "700", color: colors.textSoft },
  sipsinBadge: {
    backgroundColor: colors.text, borderRadius: radius.round,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  sipsinBadgeText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  catCard: {
    flexDirection: "row", backgroundColor: colors.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 12, alignItems: "flex-start",
  },
  catIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  catLabel: { fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 4 },
  catBody: { fontSize: 14, lineHeight: 21, color: colors.text },
  luckyRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  luckyChip: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, alignItems: "center",
  },
  luckyLabel: { fontSize: 12, color: colors.textSoft, fontWeight: "600", marginTop: 6 },
  luckyValue: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },
  colorDot: {
    width: 22, height: 22, borderRadius: 11, marginTop: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  guaHanja: { fontSize: 40, fontWeight: "800", color: colors.text, marginBottom: 8 },
  guaName: { fontSize: 18, fontWeight: "800", color: colors.primaryDeep, marginBottom: 12 },
  monthRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 8,
  },
  monthNum: { fontSize: 14, fontWeight: "800", color: colors.text, width: 40 },
  monthLevel: { fontSize: 14, fontWeight: "800", width: 28 },
  monthText: { fontSize: 13, color: colors.textSoft, flex: 1, lineHeight: 19 },
  currentCard: { borderColor: colors.primary, borderWidth: 2 },
  daeyunHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  daeyunTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
  nowBadge: {
    fontSize: 12, fontWeight: "800", color: "#FFFFFF",
    backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.round,
  },
  daeyunGanzhi: { fontSize: 14, fontWeight: "700", color: colors.primaryDeep, marginBottom: 8 },
});
