import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, ohengColors, radius } from "../src/theme";
import { calcSaju, getPillarsSipsin, Pillar, Oheng } from "../src/lib/saju";

const PILLAR_LABELS = ["시", "일", "월", "년"] as const;

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

export default function ResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const input = JSON.parse(data);
  const result = calcSaju(input);
  const sipsin = getPillarsSipsin(result);

  const pillars: (Pillar | null)[] = [result.time, result.day, result.month, result.year];
  const sipsins: (string | null)[] = [sipsin.time, sipsin.day, sipsin.month, sipsin.year];
  const total = Object.values(result.fiveElements).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>사주팔자</Text>
      <Text style={styles.subtitle}>
        {input.year}년 {input.month}월 {input.day}일 {input.isLunar ? "(음력)" : "(양력)"}
        {input.hour >= 0 ? ` ${input.hour}시` : " 시간 미상"}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 20,
  },
  ohengRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  ohengLabel: { fontSize: 15, fontWeight: "800", width: 24 },
  barBg: { flex: 1, height: 10, backgroundColor: colors.background, borderRadius: 5, marginHorizontal: 10, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
  ohengCount: { fontSize: 14, fontWeight: "700", color: colors.text, width: 16, textAlign: "right" },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
});
