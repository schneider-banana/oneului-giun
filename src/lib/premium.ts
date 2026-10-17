/**
 * 유료 콘텐츠 잠금 상태
 *
 * RevenueCat 연동 전까지는 AsyncStorage 플래그로 관리.
 * 연동 후에는 여기서 RevenueCat entitlement를 확인하도록 교체한다.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const REPORT_KEY = "oneului-giun:premium-report";
const MATCH_KEY = "oneului-giun:premium-match";

/** 정통사주 리포트 해제 여부 */
export async function isReportUnlocked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(REPORT_KEY)) === "1";
  } catch {
    return false;
  }
}

/** 궁합 해제 여부 */
export async function isMatchUnlocked(): Promise<boolean> {
  try {
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
