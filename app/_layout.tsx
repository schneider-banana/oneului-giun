import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useIsDark } from "../src/theme";

export default function RootLayout() {
  const isDark = useIsDark();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#221C17" : "#FFFBF4" },
          headerTintColor: isDark ? "#F4EBDF" : "#332E29",
        }}
      >
        <Stack.Screen name="index" options={{ title: "오늘의기운" }} />
        <Stack.Screen name="input" options={{ title: "생년월일 입력" }} />
        <Stack.Screen name="result" options={{ title: "사주 결과" }} />
        <Stack.Screen name="report" options={{ title: "정통사주 리포트" }} />
        <Stack.Screen name="match" options={{ title: "궁합" }} />
        <Stack.Screen name="tarot" options={{ title: "오늘의 타로" }} />
        <Stack.Screen name="dream" options={{ title: "꿈해몽" }} />
      </Stack>
    </>
  );
}
