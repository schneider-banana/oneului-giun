/**
 * 정통사주 리포트 (유료)
 * - 일간 성격 상세 풀이 + 십성 해석 + 오행/용신 분석
 * - RevenueCat 연동 전까지 잠금 화면 표시
 */
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, ohengColors, radius, useColors, useIsDark } from "../src/theme";
import { PaywallSheet } from "../src/components/PaywallSheet";
import { calcSaju, getPillarsSipsin, Oheng } from "../src/lib/saju";
import { calcYongsin, YONGSIN_GUIDE, YONGSIN_TIP } from "../src/lib/yongsin";
import { DAYSTEM_DETAIL } from "../src/data/daystems";
import { SIPSIN_DETAIL } from "../src/data/sipsin-detail";
import { isReportUnlocked } from "../src/lib/premium";

function useStyles() {
  const c = useColors();
  return useMemo(() => createStyles(c), [c]);
}

const PILLAR_ORDER = [
  { key: "time", label: "시주" },
  { key: "day", label: "일주" },
  { key: "month", label: "월주" },
  { key: "year", label: "년주" },
] as const;

function LockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const styles = useStyles();
  const c = useColors();
  const isDark = useIsDark();
  const [paywall, setPaywall] = useState<"vip" | "report" | "compat" | null>(null);
  const buy = (kind: "vip" | "report" | "compat") => setPaywall(kind);
  return (
    <ScrollView contentContainerStyle={styles.lockContent}>
      <LinearGradient
        colors={isDark ? ["#33241A", "#241A12"] : ["#FFE7C9", "#FFF6E9"]}
        style={styles.lockHero}
      >
        <MaterialIcons name="lock" size={44} color={c.primaryDeep} />
        <Text style={styles.lockTitle}>정통사주 리포트</Text>
        <Text style={styles.lockDesc}>
          일간 성격 심층 풀이{"\n"}사주 전체 십성 해석{"\n"}오행 분석과 용신 가이드
        </Text>
      </LinearGradient>
      <Pressable
        style={({ pressed }) => [styles.buyBtn, pressed && styles.pressed]}
        onPress={() => buy("vip")}
      >
        <Text style={styles.buyBtnText}>VIP로 무제한 열람</Text>
        <Text style={styles.buyBtnSub}>월 3,900원 · 모든 유료 콘텐츠</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.buyBtnOutline, pressed && styles.pressed]}
        onPress={() => buy("report")}
      >
        <Text style={styles.buyBtnOutlineText}>건당 결제로 이 리포트 열람</Text>
      </Pressable>
      <Text style={styles.lockNote}>결제 연동 준비 중 — 곧 만나요</Text>
    
      <PaywallSheet
        visible={paywall !== null}
        product={paywall ?? "vip"}
        onClose={() => setPaywall(null)}
        onUnlocked={onUnlocked}
      />
    </ScrollView>
  );
}

export default function ReportScreen() {
  const styles = useStyles();
  const c = useColors();
  const isDark = useIsDark();
  const { data } = useLocalSearchParams<{ data: string }>();
  const input = JSON.parse(data);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    isReportUnlocked().then(setUnlocked);
  }, []);

  const result = useMemo(() => calcSaju(input), [input]);
  const sipsins = useMemo(() => getPillarsSipsin(result), [result]);
  const yongsin = useMemo(() => calcYongsin(result), [result]);
  const dayDetail = DAYSTEM_DETAIL[result.dayStem];

  if (unlocked === null) {
    return <View style={styles.container} />;
  }
  if (!unlocked) {
    return (
      <View style={styles.container}>
        <LockScreen onUnlocked={() => setUnlocked(true)} />
      </View>
    );
  }

  const pillars = { time: result.time, day: result.day, month: result.month, year: result.year };
  const ohengOrder: Oheng[] = ["목", "화", "토", "금", "수"];
  const total = Object.values(result.fiveElements).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={isDark ? ["#33241A", "#241A12"] : ["#FFE7C9", "#FFF6E9"]}
          style={styles.hero}
        >
          <Text style={styles.heroKicker}>정통사주 리포트</Text>
          <Text style={styles.heroName}>
            {input.profileName ?? "나의 사주"}
          </Text>
          <Text style={styles.heroStem}>
            {result.dayStem}일간 · {dayDetail?.keyword ?? ""}
          </Text>
          <Text style={styles.heroMeta}>{dayDetail?.metaphor ?? ""}</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>일간 성격 풀이</Text>
        <View style={styles.card}>
          {dayDetail?.paragraphs.map((p, i) => (
            <Text key={i} style={[styles.body, i > 0 && styles.paraGap]}>
              {p}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>사주 전체 십성 해석</Text>
        {PILLAR_ORDER.map(({ key, label }) => {
          const sipsin = sipsins[key];
          if (!sipsin) return null;
          const detail = SIPSIN_DETAIL[sipsin];
          return (
            <View key={key} style={styles.card}>
              <View style={styles.sipsinHeader}>
                <Text style={styles.sipsinLabel}>{label}</Text>
                <View style={[styles.sipsinBadge, { backgroundColor: c.primarySoft }]}>
                  <Text style={[styles.sipsinBadgeText, { color: c.primaryDeep }]}>
                    {sipsin}
                  </Text>
                </View>
              </View>
              <Text style={styles.sipsinKeyword}>{detail.keyword}</Text>
              {detail.paragraphs.map((p, i) => (
                <Text key={i} style={[styles.body, i > 0 && styles.paraGap]}>
                  {p}
                </Text>
              ))}
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>오행 분석과 용신</Text>
        <View style={styles.card}>
          {ohengOrder.map((o) => {
            const count = result.fiveElements[o];
            return (
              <View key={o} style={styles.ohengRow}>
                <Text style={[styles.ohengLabel, { color: ohengColors[o] }]}>{o}</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(count / Math.max(total, 1)) * 100}%`,
                        backgroundColor: ohengColors[o],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.ohengCount}>{count}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.card}>
          <View style={styles.yongsinRow}>
            <View style={[styles.yongsinBadge, { backgroundColor: ohengColors[yongsin.yongsin] }]}>
              <Text style={styles.yongsinBadgeText}>{yongsin.yongsin}</Text>
            </View>
            <Text style={styles.yongsinTitle}>
              용신은 {yongsin.yongsin}, 희신은 {yongsin.huisin}
            </Text>
          </View>
          {YONGSIN_GUIDE.map((p, i) => (
            <Text key={i} style={[styles.body, i > 0 && styles.paraGap]}>
              {p}
            </Text>
          ))}
          <Text style={[styles.body, styles.paraGap, styles.tip]}>
            {YONGSIN_TIP[yongsin.yongsin]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    pressed: { opacity: 0.7 },
    hero: {
      borderRadius: radius.xl, padding: 24, alignItems: "center",
      marginBottom: 20, borderWidth: 1, borderColor: colors.border,
    },
    heroKicker: {
      fontSize: 13, fontWeight: "800", color: colors.primaryDeep,
      letterSpacing: 1.5, marginBottom: 8,
    },
    heroName: { fontSize: 22, fontWeight: "800", color: colors.text },
    heroStem: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 6 },
    heroMeta: { fontSize: 14, color: colors.textSoft, marginTop: 6 },
    sectionTitle: {
      fontSize: 16, fontWeight: "800", color: colors.text,
      marginBottom: 12, marginTop: 8, letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 16, marginBottom: 12,
    },
    body: { fontSize: 14, lineHeight: 22, color: colors.text },
    paraGap: { marginTop: 10 },
    tip: {
      backgroundColor: colors.primarySoft, borderRadius: radius.md,
      padding: 12, color: colors.primaryDeep,
    },
    sipsinHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    sipsinLabel: { fontSize: 14, fontWeight: "700", color: colors.textSoft, marginRight: 8 },
    sipsinBadge: { borderRadius: radius.round, paddingHorizontal: 12, paddingVertical: 4 },
    sipsinBadgeText: { fontSize: 15, fontWeight: "800" },
    sipsinKeyword: {
      fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 8,
    },
    ohengRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    ohengLabel: { fontSize: 15, fontWeight: "800", width: 24 },
    barBg: {
      flex: 1, height: 10, borderRadius: 5,
      backgroundColor: colors.background, marginHorizontal: 10,
    },
    barFill: { height: 10, borderRadius: 5 },
    ohengCount: { fontSize: 14, fontWeight: "700", color: colors.textSoft, width: 20, textAlign: "right" },
    yongsinRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    yongsinBadge: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: "center", justifyContent: "center", marginRight: 10,
    },
    yongsinBadgeText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
    yongsinTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
    // 잠금 화면
    lockContent: { padding: 20, paddingBottom: 40 },
    lockHero: {
      borderRadius: radius.xl, padding: 32, alignItems: "center",
      marginBottom: 20, borderWidth: 1, borderColor: colors.border,
    },
    lockTitle: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 12 },
    lockDesc: {
      fontSize: 14, lineHeight: 24, color: colors.textSoft,
      textAlign: "center", marginTop: 12,
    },
    buyBtn: {
      backgroundColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: 16, alignItems: "center", marginBottom: 10,
    },
    buyBtnText: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
    buyBtnSub: { fontSize: 13, color: "#FFFFFF", opacity: 0.85, marginTop: 4 },
    buyBtnOutline: {
      borderWidth: 1, borderColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: 14, alignItems: "center", marginBottom: 16,
    },
    buyBtnOutlineText: { fontSize: 16, fontWeight: "800", color: colors.primaryDeep },
    lockNote: { fontSize: 13, color: colors.inactive, textAlign: "center" },
  });
