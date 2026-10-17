/** 오늘의기운 — 디자인 토큰 (라이트/다크) */
import { useColorScheme } from "react-native";

export interface ThemeColors {
  background: string;
  card: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  text: string;
  textSoft: string;
  border: string;
  inactive: string;
  danger: string;
}

export const colors: ThemeColors = {
  background: "#FFFBF4",
  card: "#FFFFFF",
  primary: "#FF8C42",
  primaryDeep: "#D96C1E",
  primarySoft: "#FFF1E2",
  text: "#332E29",
  textSoft: "#8A8175",
  border: "#F1E7D6",
  inactive: "#B9B0A4",
  danger: "#E5484D",
};

export const darkColors: ThemeColors = {
  background: "#161210",
  card: "#221C17",
  primary: "#FF8C42",
  primaryDeep: "#FFA268",
  primarySoft: "#3A2A17",
  text: "#F4EBDF",
  textSoft: "#A89880",
  border: "#383026",
  inactive: "#6E6154",
  danger: "#FF7070",
};

/** 시스템 설정(라이트/다크)에 맞는 팔레트 */
export function useColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : colors;
}

export function useIsDark(): boolean {
  return useColorScheme() === "dark";
}

export const ohengColors: Record<string, string> = {
  목: "#2E9E5B",
  화: "#E5484D",
  토: "#C98A2C",
  금: "#8A8F98",
  수: "#3B82F6",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, round: 999 };
