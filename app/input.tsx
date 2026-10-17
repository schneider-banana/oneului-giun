import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, radius, useColors } from "../src/theme";
import { Stepper } from "../src/components/Stepper";
import { FREE_LIMIT, listProfiles, saveProfile } from "../src/lib/profiles";

export default function InputScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const [name, setName] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(12);
  const [hourUnknown, setHourUnknown] = useState(false);
  const [gender, setGender] = useState<1 | 0>(1); // 1=남, 0=여

  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);

  const go = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("이름 입력", "누구의 사주인지 이름을 입력해주세요.");
      return;
    }
    const existing = await listProfiles();
    if (existing.length >= FREE_LIMIT) {
      Alert.alert(
        "보관함 가득 참",
        `무료는 ${FREE_LIMIT}명까지 저장할 수 있어요.\n(VIP 무제한 — 준비 중)`
      );
      return;
    }
    const profile = await saveProfile({
      name: trimmed,
      year, month, day: safeDay,
      hour: hourUnknown ? -1 : hour,
      isLunar, gender,
    });
    router.push({
      pathname: "/result",
      params: {
        data: JSON.stringify({
          year, month, day: safeDay,
          hour: hourUnknown ? -1 : hour,
          isLunar, gender,
          profileId: profile.id, profileName: profile.name,
        }),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>생년월일을 입력하세요</Text>
      <Text style={styles.desc}>정확할수록 운세도 정확해진다</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="person" size={20} color={c.primaryDeep} />
          <Text style={styles.cardTitle}>이름</Text>
        </View>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="예: 나, 엄마, 연인"
          placeholderTextColor={c.inactive}
          maxLength={12}
        />
      </View>

      <View style={styles.toggleRow}>
        {[
          { label: "양력", value: false, icon: "wb-sunny" as const },
          { label: "음력", value: true, icon: "nightlight-round" as const },
        ].map((o) => (
          <Pressable
            key={o.label}
            style={[styles.toggle, isLunar === o.value && styles.toggleActive]}
            onPress={() => setIsLunar(o.value)}
          >
            <MaterialIcons
              name={o.icon}
              size={20}
              color={isLunar === o.value ? c.primaryDeep : c.textSoft}
            />
            <Text style={[styles.toggleText, isLunar === o.value && styles.toggleTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.toggleRow}>
        {[
          { label: "남자", value: 1, icon: "male" as const },
          { label: "여자", value: 0, icon: "female" as const },
        ].map((o) => (
          <Pressable
            key={o.label}
            style={[styles.toggle, gender === o.value && styles.toggleActive]}
            onPress={() => setGender(o.value as 1 | 0)}
          >
            <MaterialIcons
              name={o.icon}
              size={20}
              color={gender === o.value ? c.primaryDeep : c.textSoft}
            />
            <Text style={[styles.toggleText, gender === o.value && styles.toggleTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="cake" size={20} color={c.primaryDeep} />
          <Text style={styles.cardTitle}>생년월일</Text>
        </View>
        <Stepper label="년" value={year} min={1920} max={2026} onChange={setYear} unit="년" />
        <Stepper label="월" value={month} min={1} max={12} onChange={setMonth} unit="월" />
        <Stepper label="일" value={safeDay} min={1} max={daysInMonth} onChange={setDay} unit="일" />
      </View>

      <View style={styles.card}>
        <View style={styles.hourHeader}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="schedule" size={20} color={c.primaryDeep} />
            <Text style={styles.cardTitle}>태어난 시간</Text>
          </View>
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
        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    pressed: { opacity: 0.7 },
    title: { fontSize: 22, fontWeight: "800", color: colors.text },
    desc: { fontSize: 14, color: colors.textSoft, marginTop: 4, marginBottom: 16 },
    toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    toggle: {
      flex: 1, flexDirection: "row", gap: 6, paddingVertical: 12, borderRadius: radius.md,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    toggleActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    toggleText: { fontSize: 16, fontWeight: "600", color: colors.textSoft },
    toggleTextActive: { color: colors.primaryDeep },
    card: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
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
    nameInput: {
      fontSize: 17, color: colors.text,
      borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
      paddingHorizontal: 14, paddingVertical: 12, marginTop: 10,
      backgroundColor: colors.background,
    },
    cta: {
      flexDirection: "row", gap: 6,
      backgroundColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 8,
    },
    ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  });
