/**
 * 유료 콘텐츠 잠금 상태
 *
 * RevenueCat entitlement를 우선 확인하고, 폴백으로 AsyncStorage 플래그 사용.
 * (QA/테스트용으로 플래그를 직접 켤 수 있음)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasOneTimePurchase, isVipActive, PRODUCTS } from "./purchases";

const REPORT_KEY = "oneului-giun:premium-report";
const MATCH_KEY = "oneului-giun:premium-match";

/** 정통사주 리포트 해제 여부 (VIP 또는 건당 구매) */
export async function isReportUnlocked(): Promise<boolean> {
  try {
    if (await isVipActive()) return true;
    if (await hasOneTimePurchase(PRODUCTS.reportOnce)) return true;
    return (await AsyncStorage.getItem(REPORT_KEY)) === "1";
  } catch {
    return false;
  }
}

/** 궁합 해제 여부 (VIP 또는 건당 구매) */
export async function isMatchUnlocked(): Promise<boolean> {
  try {
    if (await isVipActive()) return true;
    if (await hasOneTimePurchase(PRODUCTS.compatOnce)) return true;
    return (await AsyncStorage.getItem(MATCH_KEY)) === "1";
  } catch {
    return false;
  }
}

/** (내부/QA용) 해제 플래그 설정 */
export async function setReportUnlocked(on: boolean): Promise<void> {
  await AsyncStorage.setItem(REPORT_KEY, on ? "1" : "0");
}

/** (내부/QA용) 해제 플래그 설정 */
export async function setMatchUnlocked(on: boolean): Promise<void> {
  await AsyncStorage.setItem(MATCH_KEY, on ? "1" : "0");
}
