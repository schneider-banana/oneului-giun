import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
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
          일간은 '나 자신'을 뜻합니다. {result.dayStem}일간의 상세 성격 풀이는 정통사주
          리포트에서 확인할 수 있습니다.
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 오늘의 운세 탭
// ---------------------------------------------------------------------------
function DailyTab({ input }: { input: any }) {
  const fortune = useMemo(() => {
    const r = calcSaju(input);
    return calcDailyFortune(input.year, input.month, input.day, r.dayStem);
  }, [input]);

  const categories = [
    { label: "총운", text: fortune.text.total },
    { label: "애정운", text: fortune.text.love },
    { label: "재물운", text: fortune.text.money },
    { label: "건강운", text: fortune.text.health },
  ];

  return (
    <View>
      <Text style={styles.title}>오늘의 운세</Text>
      <Text style={styles.subtitle}>{fortune.dateLabel} · 일진 {fortune.dayPillar.korean}({fortune.dayPillar.hanja})</Text>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>오늘의 총운</Text>
        <Text style={styles.score}>{fortune.score}점</Text>
        <Text style={styles.sipsinBig}>{fortune.sipsin}의 날</Text>
      </View>
      {categories.map((c) => (
        <View key={c.label} style={styles.card}>
          <Text style={styles.cardTitle}>{c.label}</Text>
          <Text style={styles.body}>{c.text}</Text>
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>행운 요소</Text>
        <Text style={styles.body}>
          행운의 색 {fortune.luckyColor} · 행운의 숫자 {fortune.luckyNumber} · 행운의 방향 {fortune.luckyDirection}
        </Text>
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
