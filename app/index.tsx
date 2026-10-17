import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { colors, radius } from "../src/theme";
import { deleteProfile, listProfiles, profileToParams, Profile } from "../src/lib/profiles";
import {
  cancelReminders, isReminderEnabled, refreshReminders,
  requestReminderPermission, scheduleReminders,
} from "../src/lib/reminder";

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reminderOn, setReminderOn] = useState(false);

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
      await scheduleReminders(ps[0]);
      setReminderOn(true);
    } else {
      await cancelReminders();
      setReminderOn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의기운</Text>
      <Text style={styles.subtitle}>광고 없는 사주 운세</Text>
      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        onPress={() => router.push("/input")}
      >
        <Text style={styles.ctaText}>＋ 사주 추가하기</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>보관함 ({profiles.length}/3)</Text>
      {profiles.length === 0 ? (
        <Text style={styles.empty}>아직 저장된 사주가 없다.{"\n"}가족이나 연인의 사주를 저장해보자.</Text>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(p) => p.id}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => openProfile(item)}
              onLongPress={() => remove(item)}
            >
              <View style={styles.cardText}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  {item.year}.{item.month}.{item.day} {item.isLunar ? "(음력)" : "(양력)"} ·{" "}
                  {item.gender === 1 ? "남" : "여"}
                </Text>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => remove(item)}>
                <Text style={styles.deleteText}>삭제</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
      {profiles.length > 0 && (
        <Text style={styles.hint}>길게 누르면 삭제할 수 있다</Text>
      )}

      <Text style={styles.sectionTitle}>알림</Text>
      <View style={styles.reminderRow}>
        <View style={styles.reminderText}>
          <Text style={styles.reminderTitle}>매일 아침 7시 운세 알림</Text>
          <Text style={styles.reminderSub}>소리 없이 조용히 도착해</Text>
        </View>
        <Switch
          value={reminderOn}
          onValueChange={toggleReminder}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    alignItems: "center", padding: 24, paddingTop: 72,
  },
  pressed: { opacity: 0.7 },
  title: { fontSize: 34, fontWeight: "800", color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSoft, marginBottom: 28 },
  cta: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 16, paddingHorizontal: 48, marginBottom: 36,
  },
  ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  sectionTitle: {
    fontSize: 17, fontWeight: "800", color: colors.text,
    alignSelf: "flex-start", marginBottom: 12,
  },
  empty: {
    fontSize: 14, color: colors.textSoft, textAlign: "center", lineHeight: 22,
  },
  list: { width: "100%" },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 10,
  },
  cardText: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textSoft },
  deleteBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.round, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
  },
  deleteText: { fontSize: 13, fontWeight: "700", color: colors.danger },
  hint: { fontSize: 12, color: colors.inactive, marginTop: 8, marginBottom: 24 },
  reminderRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, width: "100%",
  },
  reminderText: { flex: 1 },
  reminderTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 4 },
  reminderSub: { fontSize: 13, color: colors.textSoft },
});
