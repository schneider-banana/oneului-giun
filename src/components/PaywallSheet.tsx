/** 유료 기능 잠금 해제용 페이월 바텀시트 */
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors, radius, useColors, useIsDark } from "../theme";
import { isMockMode, purchaseProduct, restorePurchases } from "../lib/purchases";

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  /** "vip" | "report" | "compat" */
  product: "vip" | "report" | "compat";
}

const PRODUCT_META = {
  vip: {
    title: "VIP 무제한",
    price: "월 3,900원",
    desc: "보관함 무제한 + 모든 유료 콘텐츠 무제한",
    productId: "oneului_vip_monthly",
    icon: "workspace-premium" as const,
  },
  report: {
    title: "정통사주 리포트",
    price: "건당 4,900원",
    desc: "10일간 성격 풀이 + 십성 해석 + 용신 분석",
    productId: "oneului_report_once",
    icon: "auto-stories" as const,
  },
  compat: {
    title: "궁합 보기",
    price: "건당 2,900원",
    desc: "두 사람의 사주로 보는 인연 궁합",
    productId: "oneului_compat_once",
    icon: "favorite" as const,
  },
};

export function PaywallSheet({ visible, onClose, onUnlocked, product }: PaywallProps) {
  const c = useColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(c), [c]);
  const [busy, setBusy] = useState(false);
  const meta = PRODUCT_META[product];

  const buy = async () => {
    if (isMockMode()) {
      Alert.alert(
        "결제 준비 중",
        "스토어 출시 후 이용할 수 있어. (현재 테스트 모드)"
      );
      return;
    }
    setBusy(true);
    const ok = await purchaseProduct(meta.productId);
    setBusy(false);
    if (ok) {
      onUnlocked();
      onClose();
    }
  };

  const restore = async () => {
    setBusy(true);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) {
      onUnlocked();
      onClose();
    } else {
      Alert.alert("복원", "복원할 구매 내역이 없어.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.dim} onPress={onClose} />
      <View style={styles.sheet}>
        <LinearGradient
          colors={isDark ? ["#33241A", "#241A12"] : ["#FFE7C9", "#FFF6E9"]}
          style={styles.header}
        >
          <MaterialIcons name={meta.icon} size={40} color={c.primary} />
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.price}>{meta.price}</Text>
        </LinearGradient>
        <Text style={styles.desc}>{meta.desc}</Text>
        <Pressable
          style={[styles.cta, busy && styles.disabled]}
          onPress={buy}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>구매하기</Text>
          )}
        </Pressable>
        <Pressable style={styles.restore} onPress={restore} disabled={busy}>
          <Text style={styles.restoreText}>구매 복원</Text>
        </Pressable>
        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    dim: {
      flex: 1, backgroundColor: "rgba(51,46,41,0.55)",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: 24,
      paddingBottom: 40,
    },
    header: {
      borderRadius: radius.lg,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginTop: 12,
    },
    price: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.primaryDeep,
      marginTop: 8,
    },
    desc: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 20,
    },
    cta: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    disabled: { opacity: 0.6 },
    ctaText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
    restore: { paddingVertical: 10, alignItems: "center" },
    restoreText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primaryDeep,
    },
    close: { paddingVertical: 10, alignItems: "center" },
    closeText: { fontSize: 14, color: colors.textSoft },
  });
