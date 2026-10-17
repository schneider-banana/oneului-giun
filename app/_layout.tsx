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
      </Stack>
    </>
  );
}
