import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, radius, useColors } from "../src/theme";
import { DreamEntry, searchDreams } from "../src/data/dreams";

const LUCK_STYLE: Record<DreamEntry["luck"], { label: string; color: string; bg: string }> = {
  good: { label: "길몽", color: "#2E9E5B", bg: "#2E9E5B1A" },
  bad: { label: "흉몽", color: "#E5484D", bg: "#E5484D1A" },
  neutral: { label: "보통", color: "#8A8F98", bg: "#8A8F981A" },
};

export default function Dream() {
  const c = useColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchDreams(query), [query]);
  const searched = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={c.inactive} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="꿈에 나온 걸 검색해봐 (예: 뱀, 물, 이빨)"
          placeholderTextColor={c.inactive}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <MaterialIcons name="close" size={20} color={c.inactive} />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {!searched ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="bedtime" size={32} color={c.inactive} />
            <Text style={styles.empty}>
              어젯밤 꿈이 기억나?{"\n"}키워드를 검색하면 해몽을 알려줄게.
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="cloud-off" size={32} color={c.inactive} />
            <Text style={styles.empty}>
              '{query.trim()}'에 대한 해몽이 아직 없어.{"\n"}비슷한 말로 다시 검색해봐.
            </Text>
          </View>
        ) : (
          results.map((d) => {
            const luck = LUCK_STYLE[d.luck];
            return (
              <View key={d.title} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{d.title}</Text>
                  <View style={[styles.luckBadge, { backgroundColor: luck.bg }]}>
                    <Text style={[styles.luckText, { color: luck.color }]}>{luck.label}</Text>
                  </View>
                </View>
                <Text style={styles.meaning}>{d.meaning}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    searchBox: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12,
      marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 16, color: colors.text },
    list: { flex: 1 },
    listContent: { gap: 10, paddingBottom: 24 },
    emptyCard: {
      alignItems: "center", padding: 32,
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    },
    empty: { fontSize: 14, color: colors.textSoft, textAlign: "center", lineHeight: 22, marginTop: 12 },
    card: {
      backgroundColor: colors.card, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, padding: 16,
    },
    cardHeader: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      marginBottom: 8,
    },
    cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
    luckBadge: { borderRadius: radius.round, paddingHorizontal: 10, paddingVertical: 3 },
    luckText: { fontSize: 12, fontWeight: "800" },
    meaning: { fontSize: 14, color: colors.textSoft, lineHeight: 22 },
  });
