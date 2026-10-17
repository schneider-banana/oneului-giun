/**
 * 매일 아침 7시 오늘의 운세 알림 (로컬 알림, 서버 0원)
 * - 무음: 소리·진동 없이 배너만 조용히 표시
 * - 앱을 켤 때마다 다음 7일치를 미리 예약 (매일 내용이 달라짐)
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { calcSaju } from "./saju";
import { calcDailyFortune } from "./fortune";
import { Profile } from "./profiles";

const ENABLED_KEY = "oneului-giun:reminder-enabled";
const CHANNEL_ID = "daily-fortune";
const DAYS_AHEAD = 7;
const HOUR = 7;

export async function isReminderEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) === "1";
}

let channelReady = false;

/** 안드로이드 무음 채널 설정 (Expo Go 등에서 실패할 수 있어 방어) */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "오늘의 운세",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0],
      lightColor: "#FF8C42",
      sound: null, // 채널 자체를 무음으로
    });
    channelReady = true;
  } catch (e) {
    // Expo Go 등 일부 환경에서 채널 매니저가 없어 NPE 발생 → 기본 채널로 폴백
    console.warn("[reminder] 알림 채널 생성 실패, 기본 채널 사용:", e);
    channelReady = false;
  }
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(ENABLED_KEY, "0");
}

/**
 * 다음 7일치 알림 예약 (각 날짜의 운세로 내용 생성)
 * 오늘 7시가 지났으면 내일부터
 */
export async function scheduleReminders(profile: Profile): Promise<void> {
  await ensureChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const saju = calcSaju({
    year: profile.year, month: profile.month, day: profile.day,
    hour: profile.hour, isLunar: profile.isLunar,
  });

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(HOUR, 0, 0, 0);
    if (date.getTime() <= Date.now() + 60_000) continue; // 지난 시간 스킵

    const fortune = calcDailyFortune(
      profile.year, profile.month, profile.day, saju.dayStem, date
    );
    const firstLine = fortune.text.total.split(".")[0];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `오늘의 운세 ${fortune.score}점`,
        body: `${profile.name} — ${fortune.sipsin}의 날. ${firstLine}.`,
        sound: false, // 무음 (iOS)
        // 채널 생성에 성공했을 때만 지정 (Expo Go 등에서는 기본 채널 사용)
        ...(Platform.OS === "android" && channelReady ? { channelId: CHANNEL_ID } : {}),
        data: { profileId: profile.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
  await AsyncStorage.setItem(ENABLED_KEY, "1");
}

/** 앱 실행 시 호출: 켜져 있으면 7일치를 다시 예약 (윈도우 롤링) */
export async function refreshReminders(getProfile: () => Promise<Profile | null>): Promise<void> {
  if (!(await isReminderEnabled())) return;
  const profile = await getProfile();
  if (!profile) {
    await cancelReminders();
    return;
  }
  await scheduleReminders(profile);
}

/** 알림 권한 요청 */
export async function requestReminderPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}
