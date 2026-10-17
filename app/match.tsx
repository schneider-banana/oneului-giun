/**
 * 궁합 (유료)
 * - 보관함에서 2명 선택 → 궁합 결과
 * - RevenueCat 연동 전까지 잠금 화면 표시
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, ohengColors, radius, useColors, useIsDark } from "../src/theme";
import { calcSaju } from "../src/lib/saju";
import { calcMatch } from "../src/lib/match";
import { listProfiles, Profile } from "../src/lib/profiles";
import { isMatchUnlocked } from "../src/lib/premium";
import {
  MATCH_FIELDS, MATCH_VERDICT, scoreToBand,
} from "../src/data/match-text";

function useStyles() {
  const c = useColors();
  return useMemo(() => createStyles(c), [c]);
}

function ScoreRing({ score }: { score: number }) {
  const theme = useColors();
  const isDark = useIsDark();
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
          <SvgGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8C42" />
            <Stop offset="1" stopColor={isDark ? "#FFA268" : "#D96C1E"} />
          </SvgGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} stroke={isDark ? "#383026" : "#F3E4CE"} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c} cy={c} r={r} stroke="url(#matchGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ * progress} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={scoreCenter}>
        <Text style={[scoreTextBase, { color: theme.text }]}>{score}</Text>
        <Text style={[scoreUnitBase, { color: theme.textSoft }]}>점</Text>
      </View>
    </View>
  );
}

const scoreCenter: any = {
  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  alignItems: "center", justifyContent: "center",
};
const scoreTextBase: any = { fontSize: 44, fontWeight: "800" };
const scoreUnitBase: any = { fontSize: 15, marginTop: 2 };

function LockScreen() {
  const styles = useStyles();
  const c = useColors();
  const isDark = useIsDark();
  const buy = (kind: string) => {
    Alert.alert(
      "결제 준비 중",
      `${kind} 결제는 RevenueCat 연동 후 이용할 수 있어. 조금만 기다려줘.`
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.lockContent}>
      <LinearGradient
        colors={isDark ? ["#33241A", "#241A12"] : ["#FFE7C9", "#FFF6E9"]}
        style={styles.lockHero}
      >
        <MaterialIcons name="favorite" size={44} color={c.primaryDeep} />
        <Text style={styles.lockTitle}>궁합 보기</Text>
        <Text style={styles.lockDesc}>
          두 사람의 일간 오행 상생/상극 분석{"\n"}성격 · 소통 · 금전 분야별 풀이
        </Text>
      </LinearGradient>
      <Pressable
        style={({ pressed }) => [styles.buyBtn, pressed && styles.pressed]}
        onPress={() => buy("VIP 구독")}
      >
        <Text style={styles.buyBtnText}>VIP로 무제한 열람</Text>
        <Text style={styles.buyBtnSub}>월 3,900원 · 모든 유료 콘텐츠</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.buyBtnOutline, pressed && styles.pressed]}
        onPress={() => buy("건당")}
      >
        <Text style={styles.buyBtnOutlineText}>건당 결제로 궁합 열람</Text>
      </Pressable>
      <Text style={styles.lockNote}>결제 연동 준비 중 — 곧 만나요</Text>
    </ScrollView>
  );
}

export default function MatchScreen() {
  const styles = useStyles();
  const c = useColors();
  const isDark = useIsDark();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      listProfiles().then(setProfiles);
      isMatchUnlocked().then(setUnlocked);
    }, [])
  );

  useEffect(() => {
    setSelected((sel) => sel.filter((id) => profiles.some((p) => p.id === id)));
    if (selected.length === 0) setShowResult(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  const toggleSelect = (id: string) => {
    setShowResult(false);
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 2 ? [...sel, id] : [sel[1], id]
    );
  };

  const [a, b] = selected
    .map((id) => profiles.find((p) => p.id === id))
    .filter(Boolean) as Profile[];

  const matchResult = useMemo(() => {
    if (!showResult || !a || !b) return null;
    const sa = calcSaju({ year: a.year, month: a.month, day: a.day, hour: a.hour, isLunar: a.isLunar });
    const sb = calcSaju({ year: b.year, month: b.month, day: b.day, hour: b.hour, isLunar: b.isLunar });
    return calcMatch(sa, sb);
  }, [showResult, a, b]);

  // 결정적 variant 선택 (두 프로필 id 해시)
  const variantIdx = useMemo(() => {
    if (!a || !b) return 0;
    let h = 0;
    const s = a.id + b.id;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 2;
  }, [a, b]);

  if (unlocked === null) {
    return <View style={styles.container} />;
  }
  if (!unlocked) {
    return (
      <View style={styles.container}>
        <LockScreen />
      </View>
    );
  }

  const band = matchResult ? scoreToBand(matchResult.score) : "mid";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>두 사람을 선택하세요</Text>
        {profiles.length < 2 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              궁합을 보려면 보관함에 2명 이상 저장되어 있어야 해.{"\n"}홈에서 사주를 추가해줘.
            </Text>
          </View>
        ) : (
          profiles.map((p) => {
            const isSel = selected.includes(p.id);
            return (
              <Pressable
                key={p.id}
                style={[styles.profileCard, isSel && styles.profileCardSel]}
                onPress={() => toggleSelect(p.id)}
              >
                <View style={[styles.check, isSel && styles.checkSel]}>
                  {isSel && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardName}>{p.name}</Text>
                  <Text style={styles.cardSub}>
                    {p.year}.{p.month}.{p.day} {p.isLunar ? "(음력)" : "(양력)"} ·{" "}
                    {p.gender === 1 ? "남" : "여"}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
        {profiles.length >= 2 && (
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              selected.length < 2 && styles.ctaDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => selected.length === 2 && setShowResult(true)}
          >
            <Text style={styles.ctaText}>궁합 보기</Text>
          </Pressable>
        )}

        {matchResult && a && b && (
          <View style={styles.resultWrap}>
            <LinearGradient
              colors={isDark ? ["#33241A", "#241A12"] : ["#FFE7C9", "#FFF6E9"]}
              style={styles.hero}
            >
              <Text style={styles.couple}>
                {a.name} <Text style={styles.heart}>♥</Text> {b.name}
              </Text>
              <ScoreRing score={matchResult.score} />
              <View style={styles.relationBadge}>
                <Text style={styles.relationText}>
                  {matchResult.ohengRelation} · {matchResult.ohengDetail}
                </Text>
              </View>
              <Text style={styles.sipsinLine}>
                {a.name} → {b.name}: {matchResult.sipsinAtoB} / {b.name} → {a.name}: {matchResult.sipsinBtoA}
              </Text>
              <Text style={styles.verdict}>
                {MATCH_VERDICT[band][variantIdx]}
              </Text>
            </LinearGradient>

            {MATCH_FIELDS.map((f) => (
              <View key={f.field} style={styles.card}>
                <View style={styles.fieldHeader}>
                  <View
                    style={[
                      styles.fieldIcon,
                      { backgroundColor: isDark ? "#3A2A17" : "#FFF1E2" },
                    ]}
                  >
                    <MaterialIcons
                      name={f.icon}
                      size={20}
                      color={isDark ? "#FFA268" : "#D96C1E"}
                    />
                  </View>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                </View>
                <Text style={styles.body}>{f.texts[band][variantIdx]}</Text>
              </View>
            ))}

            <View style={styles.ohengCard}>
              <Text style={styles.fieldLabel}>오행으로 보는 관계</Text>
              <View style={styles.ohengDots}>
                <View style={styles.ohengDotWrap}>
                  <View style={[styles.ohengDot, { backgroundColor: ohengColors[matchResult.aOheng] }]}>
                    <Text style={styles.ohengDotText}>{matchResult.aOheng}</Text>
                  </View>
                  <Text style={styles.ohengName}>{a.name}</Text>
                </View>
                <MaterialIcons
                  name={matchResult.ohengRelation === "상극" ? "close" : "favorite"}
                  size={24}
                  color={matchResult.ohengRelation === "상극" ? c.danger : c.primary}
                />
                <View style={styles.ohengDotWrap}>
                  <View style={[styles.ohengDot, { backgroundColor: ohengColors[matchResult.bOheng] }]}>
                    <Text style={styles.ohengDotText}>{matchResult.bOheng}</Text>
                  </View>
                  <Text style={styles.ohengName}>{b.name}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    pressed: { opacity: 0.7 },
    sectionTitle: {
      fontSize: 16, fontWeight: "800", color: colors.text,
      marginBottom: 12, marginTop: 4, letterSpacing: 0.5,
    },
    emptyCard: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 24, alignItems: "center",
    },
    emptyText: { fontSize: 14, lineHeight: 22, color: colors.textSoft, textAlign: "center" },
    profileCard: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 14, marginBottom: 10,
    },
    profileCardSel: { borderColor: colors.primary, borderWidth: 2 },
    check: {
      width: 24, height: 24, borderRadius: 12,
      borderWidth: 2, borderColor: colors.inactive,
      marginRight: 12, alignItems: "center", justifyContent: "center",
    },
    checkSel: { backgroundColor: colors.primary, borderColor: colors.primary },
    cardText: { flex: 1 },
    cardName: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 4 },
    cardSub: { fontSize: 13, color: colors.textSoft },
    cta: {
      backgroundColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 8,
    },
    ctaDisabled: { opacity: 0.4 },
    ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
    resultWrap: { marginTop: 12 },
    hero: {
      borderRadius: radius.xl, padding: 24, alignItems: "center",
      marginBottom: 16, borderWidth: 1, borderColor: colors.border,
    },
    couple: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 16 },
    heart: { color: colors.primary },
    relationBadge: {
      backgroundColor: colors.text, borderRadius: radius.round,
      paddingHorizontal: 16, paddingVertical: 7, marginTop: 16,
    },
    relationText: { fontSize: 14, fontWeight: "800", color: colors.background },
    sipsinLine: { fontSize: 13, color: colors.textSoft, marginTop: 10, textAlign: "center" },
    verdict: {
      fontSize: 15, fontWeight: "700", color: colors.text,
      marginTop: 12, textAlign: "center", lineHeight: 23,
    },
    card: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 16, marginBottom: 12,
    },
    fieldHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    fieldIcon: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: "center", justifyContent: "center", marginRight: 10,
    },
    fieldLabel: { fontSize: 16, fontWeight: "800", color: colors.text },
    body: { fontSize: 14, lineHeight: 22, color: colors.text },
    ohengCard: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 16, marginBottom: 12, alignItems: "center",
    },
    ohengDots: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      marginTop: 12, gap: 20,
    },
    ohengDotWrap: { alignItems: "center" },
    ohengDot: {
      width: 52, height: 52, borderRadius: 26,
      alignItems: "center", justifyContent: "center",
    },
    ohengDotText: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
    ohengName: { fontSize: 13, fontWeight: "700", color: colors.textSoft, marginTop: 6 },
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
