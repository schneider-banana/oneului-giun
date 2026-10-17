import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors, radius, useColors } from "../theme";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}

/** 숫자 스테퍼 (생년월일시 입력용) */
export function Stepper({ label, value, min, max, onChange, unit = "" }: StepperProps) {
  const c = useColors();
  const styles = useMemo(() => createStyles(c), [c]);
  const step = (d: number) => {
    const next = Math.min(max, Math.max(min, value + d));
    onChange(next);
  };
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => step(-1)}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}{unit}</Text>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => step(1)}>
          <Text style={styles.btnText}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: { fontSize: 16, color: colors.text, fontWeight: "600" },
    controls: { flexDirection: "row", alignItems: "center", gap: 12 },
    btn: {
      width: 36,
      height: 36,
      borderRadius: radius.round,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: { opacity: 0.6 },
    btnText: { fontSize: 20, color: colors.primaryDeep, fontWeight: "700" },
    value: { fontSize: 18, fontWeight: "700", color: colors.text, minWidth: 64, textAlign: "center" },
  });
