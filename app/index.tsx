import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, radius } from "../src/theme";
import { deleteProfile, listProfiles, profileToParams, Profile } from "../src/lib/profiles";

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useFocusEffect(
    useCallback(() => {
      listProfiles().then(setProfiles);
    }, [])
  );

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
        <Text style={styles.empty}>아직 저장된 사주가 없음.{"\n"}가족이나 연인 사주 저장해봐.</Text>
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
        <Text style={styles.hint}>길게 누르면 삭제됨</Text>
      )}
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
  hint: { fontSize: 12, color: colors.inactive, marginTop: 8 },
});
