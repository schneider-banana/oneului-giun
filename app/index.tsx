import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { ThemeColors, radius, useColors, useIsDark } from "../src/theme";
import { deleteProfile, listProfiles, profileToParams, Profile } from "../src/lib/profiles";
import { calcSaju } from "../src/lib/saju";
import {
  cancelReminders, isReminderEnabled, refreshReminders,
  requestReminderPermission, scheduleReminders,
} from "../src/lib/reminder";

export default function Home() {
  const router = useRouter();
  const c = useColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(c), [c]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reminderOn, setReminderOn] = useState(false);
  const dayStems = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of profiles) {
      try {
        m[p.id] = calcSaju({
          year: p.year, month: p.month, day: p.day,
          hour: p.hour, isLunar: p.isLunar,
        }).dayStem;
      } catch { /* ignore */ }
    }
    return m;
  }, [profiles]);

  useFocusEffect(
    useCallback(() => {
      listProfiles().then(setProfiles);
      isReminderEnabled().then(setReminderOn);
      refreshReminders(() => listProfiles().then((ps) => ps[0] ?? null));
    }, [])
  );

  // 알림 탭 → 해당 사주 결과로 이동
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (res) => {
      const pid = res.notification.request.content.data?.profileId as string | undefined;
      const ps = await listProfiles();
      const p = ps.find((x) => x.id === pid) ?? ps[0];
      if (p) router.push({ pathname: "/result", params: { data: profileToParams(p) } });
    });
    return () => sub.remove();
  }, []);

  const openProfile = (p: Profile) => {
    router.push({ pathname: "/result", params: { data: profileToParams(p) } });
  };

  const remove = (p: Profile) => {
    Alert.alert("삭제", `'${p.name}'의 사주를 보관함에서 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteProfile(p.id);
          setProfiles(await listProfiles());
        },
      },
    ]);
  };

  const toggleReminder = async (on: boolean) => {
    if (on) {
      const ps = await listProfiles();
      if (ps.length === 0) {
        Alert.alert("사주 저장 필요", "먼저 사주를 하나 저장해줘.");
        return;
      }
      const granted = await requestReminderPermission();
      if (!granted) {
        Alert.alert("알림 권한", "설정에서 알림을 허용해줘.");
        return;
      }
      try {
        await scheduleReminders(ps[0]);
        setReminderOn(true);
      } catch (e) {
        console.warn("[reminder] 알림 예약 실패:", e);
        Alert.alert("알림 설정 실패", "알림 예약 중 문제가 생겼어. 다시 시도해줘.");
      }
    } else {
      await cancelReminders();
      setReminderOn(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#2A2016", "#1C1611"] : ["#FFE7C9", "#FFF6E9"]}
        style={styles.hero}
      >
        <Text style={styles.title}>오늘의기운</Text>
        <Text style={styles.subtitle}>광고 없는 사주 운세</Text>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push("/input")}
        >
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.ctaText}>사주 추가하기</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>보관함</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{profiles.length}/3</Text>
        </View>
      </View>
      {profiles.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="person-add-alt" size={32} color={c.inactive} />
          <Text style={styles.empty}>아직 저장된 사주가 없다.{"\n"}가족이나 연인의 사주를 저장해보자.</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          style={styles.list}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => openProfile(item)}
              onLongPress={() => remove(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.cardText}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {dayStems[item.id] && (
                    <View style={styles.stemBadge}>
                      <Text style={styles.stemText}>{dayStems[item.id]}일간</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSub}>
                  {item.year}.{item.month}.{item.day} {item.isLunar ? "(음력)" : "(양력)"} ·{" "}
                  {item.gender === 1 ? "남" : "여"}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={c.inactive} />
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.matchRow, pressed && styles.pressed]}
        onPress={() => router.push("/match")}
      >
        <View style={[styles.reminderIcon, { backgroundColor: c.primarySoft }]}>
          <MaterialIcons name="favorite" size={22} color={c.primaryDeep} />
        </View>
        <View style={styles.reminderText}>
          <Text style={styles.reminderTitle}>궁합 보기</Text>
          <Text style={styles.reminderSub}>두 사람의 인연을 점쳐봐</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={c.inactive} />
      </Pressable>

      <View style={styles.reminderRow}>
        <View style={[styles.reminderIcon, { backgroundColor: c.primarySoft }]}>
          <MaterialIcons name="notifications-none" size={22} color={c.primaryDeep} />
        </View>
        <View style={styles.reminderText}>
          <Text style={styles.reminderTitle}>매일 아침 7시 운세 알림</Text>
          <Text style={styles.reminderSub}>소리 없이 조용히 도착해</Text>
        </View>
        <Switch
          value={reminderOn}
          onValueChange={toggleReminder}
          trackColor={{ false: c.border, true: c.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1, backgroundColor: colors.background,
      padding: 20, paddingTop: 60,
    },
    pressed: { opacity: 0.7 },
    hero: {
      borderRadius: radius.xl, padding: 24, alignItems: "center",
      marginBottom: 24, borderWidth: 1, borderColor: colors.border,
    },
    title: { fontSize: 30, fontWeight: "800", color: colors.text, marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 20, letterSpacing: 1.5 },
    cta: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: 14, paddingHorizontal: 32,
    },
    ctaText: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
    sectionHeader: {
      flexDirection: "row", alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginRight: 8 },
    countBadge: {
      backgroundColor: colors.primarySoft, borderRadius: radius.round,
      paddingHorizontal: 10, paddingVertical: 3,
    },
    countText: { fontSize: 12, fontWeight: "800", color: colors.primaryDeep },
    emptyCard: {
      alignItems: "center", padding: 28,
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
      marginBottom: 8,
    },
    empty: {
      fontSize: 14, color: colors.textSoft, textAlign: "center", lineHeight: 22,
      marginTop: 12,
    },
    list: { width: "100%" },
    card: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 14, marginBottom: 10,
    },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.primarySoft,
      alignItems: "center", justifyContent: "center", marginRight: 12,
    },
    avatarText: { fontSize: 18, fontWeight: "800", color: colors.primaryDeep },
    cardText: { flex: 1 },
    cardName: { fontSize: 17, fontWeight: "800", color: colors.text },
    nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    stemBadge: {
      backgroundColor: colors.primarySoft, borderRadius: radius.round,
      paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8,
    },
    stemText: { fontSize: 11, fontWeight: "800", color: colors.primaryDeep, letterSpacing: 0.3 },
    cardSub: { fontSize: 13, color: colors.textSoft },
    reminderRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 14, width: "100%", marginTop: 16,
    },
    matchRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 14, width: "100%", marginTop: 16,
    },
    reminderIcon: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: "center", justifyContent: "center", marginRight: 12,
    },
    reminderText: { flex: 1 },
    reminderTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 4 },
    reminderSub: { fontSize: 13, color: colors.textSoft },
  });
