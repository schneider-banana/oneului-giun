/**
 * 바이오리듬 (생년월일 기반, 온디바이스)
 * 신체 23일 / 감성 28일 / 지성 33일 주기의 사인 곡선.
 * 점신 등 경쟁 앱의 '운세 보고서'에 포함된 기능.
 */

export interface BiorhythmDay {
  /** YYYY-MM-DD */
  date: string;
  /** -1 ~ 1 */
  physical: number;
  emotional: number;
  intellectual: number;
}

const CYCLES = { physical: 23, emotional: 28, intellectual: 33 } as const;

function daysBetween(a: Date, b: Date): number {
  const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round(ms / 86400000);
}

function rhythm(daysAlive: number, period: number): number {
  return Math.sin((2 * Math.PI * daysAlive) / period);
}

/** 생년월일 → 오늘 포함 7일간의 바이오리듬 */
export function calcBiorhythmWeek(
  birthY: number,
  birthM: number,
  birthD: number,
  now: Date = new Date()
): BiorhythmDay[] {
  const birth = new Date(birthY, birthM - 1, birthD);
  const out: BiorhythmDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const alive = daysBetween(birth, d);
    out.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`,
      physical: rhythm(alive, CYCLES.physical),
      emotional: rhythm(alive, CYCLES.emotional),
      intellectual: rhythm(alive, CYCLES.intellectual),
    });
  }
  return out;
}

/** 오늘의 리듬 상태 문구 (세련된 반말) */
export function rhythmMood(v: number): string {
  if (v >= 0.6) return "최상";
  if (v >= 0.2) return "좋음";
  if (v > -0.2) return "보통";
  if (v > -0.6) return "주의";
  return "휴식";
}
