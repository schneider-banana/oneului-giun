import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "../src/theme";

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의기운</Text>
      <Text style={styles.subtitle}>광고 없는 사주 운세</Text>
      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        onPress={() => router.push("/input")}
      >
        <Text style={styles.ctaText}>내 사주 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  pressed: { opacity: 0.7 },
  title: { fontSize: 34, fontWeight: "800", color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSoft, marginBottom: 32 },
  cta: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 16, paddingHorizontal: 48,
  },
  ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
});
