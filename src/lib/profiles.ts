/**
 * 보관함 — 저장된 사주 프로필 (AsyncStorage, 온디바이스)
 * 무료: 3명까지
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Profile {
  id: string;
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number; // -1 = 모름
  isLunar: boolean;
  gender: 1 | 0;
  createdAt: number;
}

const KEY = "oneului-giun:profiles";
export const FREE_LIMIT = 3;

function uid(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export async function listProfiles(): Promise<Profile[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function persist(profiles: Profile[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profiles));
}

export async function saveProfile(p: Omit<Profile, "id" | "createdAt">): Promise<Profile> {
  const profiles = await listProfiles();
  const profile: Profile = { ...p, id: uid(), createdAt: Date.now() };
  await persist([profile, ...profiles]);
  return profile;
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await listProfiles();
  await persist(profiles.filter((p) => p.id !== id));
}

/** 결과 화면 이동용 params로 변환 */
export function profileToParams(p: Profile): string {
  return JSON.stringify({
    year: p.year, month: p.month, day: p.day,
    hour: p.hour, isLunar: p.isLunar, gender: p.gender,
    profileId: p.id, profileName: p.name,
  });
}
