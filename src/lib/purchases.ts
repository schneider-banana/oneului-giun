/**
 * RevenueCat 결제 연동 (오늘의기운)
 *
 * TODO (출시 전):
 * 1. RevenueCat 계정 생성 → API Key 발급
 * 2. App Store Connect / Google Play Console에 상품 등록
 *    - VIP 구독: 월 3,900원 (product: oneului_vip_monthly)
 *    - 정통사주 건당: 4,900원 (product: oneului_report_once)
 *    - 궁합 건당: 2,900원 (product: oneului_compat_once)
 * 3. 아래 API_KEY에 실제 키 입력
 * 4. 실제 결제는 개발 빌드(EAS) 또는 스토어 빌드에서만 동작 (Expo Go에서는 목 모드)
 */
import { Platform } from "react-native";

// RevenueCat API Key (대시보드에서 발급) — 출시 전 입력
const API_KEY = Platform.select({
  ios: "REVENUECAT_IOS_API_KEY",
  android: "REVENUECAT_ANDROID_API_KEY",
  default: "",
}) as string;

export const PRODUCTS = {
  vipMonthly: "oneului_vip_monthly", // VIP 월 구독 3,900원
  reportOnce: "oneului_report_once", // 정통사주 건당 4,900원
  compatOnce: "oneului_compat_once", // 궁합 건당 2,900원
} as const;

export const ENTITLEMENT_VIP = "vip";
export const ENTITLEMENT_REPORT = "report_single";
export const ENTITLEMENT_COMPAT = "compat_single";

let Purchases: any = null;
let mockMode = true;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Purchases = require("react-native-purchases").default;
  mockMode = false;
} catch {
  // Expo Go 등 네이티브 모듈이 없으면 목 모드 (UI 테스트용)
  mockMode = true;
}

export function isMockMode(): boolean {
  return mockMode;
}

export async function configurePurchases(): Promise<void> {
  if (mockMode) return;
  if (!API_KEY || API_KEY.includes("REVENUECAT")) {
    console.warn("[purchases] API Key 미설정 — 목 모드로 동작");
    mockMode = true;
    return;
  }
  await Purchases.configure({ apiKey: API_KEY });
}

/** VIP 구독 중인지 */
export async function isVipActive(): Promise<boolean> {
  if (mockMode) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_VIP];
  } catch {
    return false;
  }
}

/** 건당 구매 여부 (리포트/궁합) */
export async function hasOneTimePurchase(productId: string): Promise<boolean> {
  if (mockMode) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    const entitlement =
      productId === PRODUCTS.reportOnce ? ENTITLEMENT_REPORT : ENTITLEMENT_COMPAT;
    return !!info.entitlements.active[entitlement];
  } catch {
    return false;
  }
}

/** 상품 목록 조회 */
export async function getOfferings(): Promise<any> {
  if (mockMode) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.warn("[purchases] 오퍼링 조회 실패:", e);
    return null;
  }
}

/** 구매 실행 — 성공 시 true */
export async function purchaseProduct(productId: string): Promise<boolean> {
  if (mockMode) {
    console.warn("[purchases] 목 모드 — 실제 결제 없음");
    return false;
  }
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p: any) => p.product.identifier === productId
    );
    if (!pkg) {
      console.warn("[purchases] 상품을 찾을 수 없음:", productId);
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (e: any) {
    if (!e.userCancelled) console.warn("[purchases] 구매 실패:", e);
    return false;
  }
}

/** 구매 복원 */
export async function restorePurchases(): Promise<boolean> {
  if (mockMode) return false;
  try {
    const info = await Purchases.restorePurchases();
    return Object.keys(info.entitlements.active).length > 0;
  } catch {
    return false;
  }
}
