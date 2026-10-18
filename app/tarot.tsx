import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, radius, useColors, useIsDark } from "../src/theme";
import { drawDailyTarot, drawExtraTarot, TarotDraw } from "../src/data/tarot";
import { listProfiles, Profile } from "../src/lib/profiles";
import { isVipActive } from "../src/lib/purchases";
import { PaywallSheet } from "../src/components/PaywallSheet";

/** 타로 카드 앞면 */
function CardFace({ draw, c, styles }: { draw: TarotDraw; c: ThemeColors; styles: any }) {
  const interp = draw.upright ? draw.card.upright : draw.card.reversed;
  return (
    <View style={styles.cardFace}>
      <LinearGradient
        colors={["#3A2E5C", "#241D3D"]}
        style={styles.cardArt}
      >
        <Text style={styles.cardNo}>{String(draw.card.no).padStart(2, "0")}</Text>
        <MaterialIcons name="auto-awesome" size={40} color="#E8C872" />
        <Text style={styles.cardName}>{draw.card.name}</Text>
        <Text style={styles.cardNameEn}>{draw.card.nameEn}</Text>
        {!draw.upright && (
          <View style={styles.reversedBadge}>
            <Text style={styles.reversedText}>역방향</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.keywordRow}>
        <MaterialIcons name="bolt" size={16} color={c.primaryDeep} />
        <Text style={styles.keyword}>{draw.card.keyword}</Text>
      </View>
      <InterpBlock icon="favorite" title="애정운" text={interp.love} c={c} styles={styles} />
      <InterpBlock icon="attach-money" title="재물운" text={interp.money} c={c} styles={styles} />
      <InterpBlock icon="lightbulb-outline" title="오늘의 조언" text={interp.advice} c={c} styles={styles} />
    </View>
  );
}

function InterpBlock({
  icon, title, text, c, styles,
}: {
  icon: any; title: string; text: string; c: ThemeColors; styles: any;
}) {
  return (
    <View style={styles.interp}>
      <View style={styles.interpHeader}>
        <MaterialIcons name={icon} size={16} color={c.primaryDeep} />
        <Text style={styles.interpTitle}>{title}</Text>
      </View>
      <Text style={styles.interpText}>{text}</Text>
    </View>
  );
}

export default function Tarot() {
  const c = useColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(c), [c]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [extra, setExtra] = useState<TarotDraw | null>(null);
  const [paywall, setPaywall] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listProfiles().then(setProfiles);
      setRevealed(false);
      setExtra(null);
    }, [])
  );

  const profile = profiles[0] ?? null;
  const daily = useMemo(
    () => (profile ? drawDailyTarot(profile.id) : null),
    [profile]
  );

  const draw = extra ?? daily;

  const handleExtra = async () => {
    if (!profile) return;
    if (await isVipActive()) {
      setExtra(drawExtraTarot(profile.id, String(Date.now())));
      setRevealed(true);
    } else {
      setPaywall(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!profile ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="person-add-alt" size={32} color={c.inactive} />
          <Text style={styles.empty}>
            타로를 뽑으려면 먼저 사주를 저장해줘.{"\n"}홈에서 사주를 추가해보자.
          </Text>
        </View>
      ) : !revealed ? (
        /* 카드 뒷면 — 탭하면 뒤집기 */
        <View style={styles.centerWrap}>
          <Text style={styles.dateLabel}>
            {daily?.date.slice(5).replace("-", "월 ")}일 · {profile.name}의 카드
          </Text>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => setRevealed(true)}
          >
            <LinearGradient
              colors={isDark ? ["#4A3520", "#2A2016"] : ["#FFB066", "#FF8C42"]}
              style={styles.cardBack}
            >
              <MaterialIcons name="style" size={56} color="#FFFFFF" />
              <Text style={styles.cardBackText}>탭해서 카드 뒤집기</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.hint}>매일 자정에 새로운 카드가 나와</Text>
        </View>
      ) : (
        draw && (
          <>
            <CardFace draw={draw} c={c} styles={styles} />
            {!extra && (
              <Pressable
                style={({ pressed }) => [styles.extraBtn, pressed && styles.pressed]}
                onPress={handleExtra}
              >
                <MaterialIcons name="casino" size={20} color={c.primaryDeep} />
                <Text style={styles.extraBtnText}>한 장 더 뽑기 (VIP)</Text>
              </Pressable>
            )}
          </>
        )
      )}

      <PaywallSheet
        visible={paywall}
        onClose={() => setPaywall(false)}
        onUnlocked={() => {}}
        product="vip"
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    pressed: { opacity: 0.7 },
    emptyCard: {
      alignItems: "center", padding: 32,
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    },
    empty: { fontSize: 14, color: colors.textSoft, textAlign: "center", lineHeight: 22, marginTop: 12 },
    centerWrap: { alignItems: "center", paddingTop: 24 },
    dateLabel: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 20 },
    cardBack: {
      width: 220, height: 340, borderRadius: radius.xl,
      alignItems: "center", justifyContent: "center", gap: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    cardBackText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
    hint: { fontSize: 13, color: colors.textSoft, marginTop: 20 },
    cardFace: { marginBottom: 8 },
    cardArt: {
      borderRadius: radius.xl, padding: 28, alignItems: "center",
      marginBottom: 16, borderWidth: 1, borderColor: colors.border,
    },
    cardNo: { fontSize: 13, color: "#E8C872", fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
    cardName: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", marginTop: 16 },
    cardNameEn: { fontSize: 13, color: "#B9A8D8", marginTop: 4, letterSpacing: 1 },
    reversedBadge: {
      marginTop: 12, backgroundColor: "#E8C87222",
      borderRadius: radius.round, paddingHorizontal: 12, paddingVertical: 4,
      borderWidth: 1, borderColor: "#E8C87266",
    },
    reversedText: { fontSize: 12, fontWeight: "800", color: "#E8C872" },
    keywordRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
      marginBottom: 16,
    },
    keyword: { fontSize: 16, fontWeight: "800", color: colors.primaryDeep },
    interp: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 16, marginBottom: 12,
    },
    interpHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    interpTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
    interpText: { fontSize: 14, color: colors.textSoft, lineHeight: 22 },
    extraBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      backgroundColor: colors.primarySoft, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.primary,
      paddingVertical: 14, marginTop: 8,
    },
    extraBtnText: { fontSize: 15, fontWeight: "800", color: colors.primaryDeep },
  });
