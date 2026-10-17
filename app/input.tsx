import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "../src/theme";
import { Stepper } from "../src/components/Stepper";

export default function InputScreen() {
  const router = useRouter();
  const [isLunar, setIsLunar] = useState(false);
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(12);
  const [hourUnknown, setHourUnknown] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);

  const go = () => {
    router.push({
      pathname: "/result",
      params: {
        data: JSON.stringify({
          year, month, day: safeDay,
          hour: hourUnknown ? -1 : hour,
          isLunar,
        }),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>생년월일을 입력하세요</Text>

      <View style={styles.toggleRow}>
        {[
          { label: "양력", value: false },
          { label: "음력", value: true },
        ].map((o) => (
          <Pressable
            key={o.label}
            style={[styles.toggle, isLunar === o.value && styles.toggleActive]}
            onPress={() => setIsLunar(o.value)}
          >
            <Text style={[styles.toggleText, isLunar === o.value && styles.toggleTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Stepper label="년" value={year} min={1920} max={2026} onChange={setYear} unit="년" />
        <Stepper label="월" value={month} min={1} max={12} onChange={setMonth} unit="월" />
        <Stepper label="일" value={safeDay} min={1} max={daysInMonth} onChange={setDay} unit="일" />
      </View>

      <View style={styles.card}>
        <View style={styles.hourHeader}>
          <Text style={styles.cardTitle}>태어난 시간</Text>
          <Pressable
            style={[styles.unknownBtn, hourUnknown && styles.unknownBtnActive]}
            onPress={() => setHourUnknown(!hourUnknown)}
          >
            <Text style={[styles.unknownText, hourUnknown && styles.unknownTextActive]}>
              모름
            </Text>
          </Pressable>
        </View>
        {!hourUnknown && (
          <Stepper label="시간" value={hour} min={0} max={23} onChange={setHour} unit="시" />
        )}
        {hourUnknown && (
          <Text style={styles.note}>시간을 모르면 시주를 제외하고 풀이합니다.</Text>
        )}
      </View>

      <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]} onPress={go}>
        <Text style={styles.ctaText}>내 사주 보기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.7 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 16 },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  toggle: {
    flex: 1, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  toggleText: { fontSize: 16, fontWeight: "600", color: colors.textSoft },
  toggleTextActive: { color: colors.primaryDeep },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  hourHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  unknownBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.round,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  unknownBtnActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  unknownText: { fontSize: 14, fontWeight: "600", color: colors.textSoft },
  unknownTextActive: { color: colors.primaryDeep },
  note: { fontSize: 14, color: colors.textSoft, marginTop: 8 },
  cta: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
});
