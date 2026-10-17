import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "오늘의기운" }} />
      <Stack.Screen name="input" options={{ title: "생년월일 입력" }} />
      <Stack.Screen name="result" options={{ title: "사주 결과" }} />
    </Stack>
  );
}
