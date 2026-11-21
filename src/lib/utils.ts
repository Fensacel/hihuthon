import type { Market, MarketStatus, MarketTotals, Vote } from "./types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

let counter = 0;

/** Deterministic-enough id for a client-only demo store. */
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG so the seeded demo data is stable per browser. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hoursFromNow(hours: number, from: number = Date.now()): string {
  return new Date(from + hours * 3600 * 1000).toISOString();
}

export function minutesFromNow(
  minutes: number,
  from: number = Date.now(),
): string {
  return new Date(from + minutes * 60 * 1000).toISOString();
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(value));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_PAIRS: Array<[string, string]> = [
  ["#4d90ff", "#1951fc"],
  ["#3781fc", "#0b2cb1"],
  ["#2563ff", "#03195b"],
  ["#6366f1", "#1951fc"],
  ["#0ea5e9", "#1951fc"],
  ["#1951fc", "#7c3aed"],
  ["#3182ce", "#0b2cb1"],
  ["#4d90ff", "#1e3a8a"],
];

export function avatarGradient(hue: number): string {
  const [from, to] = AVATAR_PAIRS[Math.abs(hue) % AVATAR_PAIRS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days === 1) return "kemarin";
  if (days < 30) return `${days} hari lalu`;
  const months = Math.round(days / 30);
  return `${months} bulan lalu`;
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDeadline(iso: string, now: number = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return "Ditutup";
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes} menit lagi`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lagi`;
  const days = Math.round(hours / 24);
  return `${days} hari lagi`;
}

export function marketStatus(
  market: Market,
  now: number = Date.now(),
): MarketStatus {
  if (market.resolvedOptionId) return "resolved";
  const remaining = new Date(market.closesAt).getTime() - now;
  if (remaining <= 0) return "closed";
  if (remaining <= 6 * 3600 * 1000) return "closing-soon";
  return "open";
}

export const MARKET_STATUS_LABEL: Record<MarketStatus, string> = {
  open: "Terbuka",
  "closing-soon": "Segera Tutup",
  closed: "Menunggu Validasi",
  resolved: "Selesai",
};

export function computeTotals(votes: Vote[], marketId: string): MarketTotals {
  const marketVotes = votes.filter((vote) => vote.marketId === marketId);
  const optionStakes: Record<string, number> = {};
  let pool = 0;

  for (const vote of marketVotes) {
    optionStakes[vote.optionId] = (optionStakes[vote.optionId] ?? 0) + vote.stake;
    pool += vote.stake;
  }

  const optionPercents: Record<string, number> = {};
  for (const [optionId, stake] of Object.entries(optionStakes)) {
    optionPercents[optionId] = pool > 0 ? Math.round((stake / pool) * 1000) / 10 : 0;
  }

  let leadingOptionId: string | null = null;
  let leading = -1;
  for (const [optionId, stake] of Object.entries(optionStakes)) {
    if (stake > leading) {
      leading = stake;
      leadingOptionId = optionId;
    }
  }

  return {
    optionStakes,
    optionPercents,
    pool,
    voters: marketVotes.length,
    leadingOptionId,
  };
}

/** Pari-mutuel style payout: winners share the whole pool proportionally. */
export function potentialPayout(
  stake: number,
  optionPool: number,
  pool: number,
): number {
  if (stake <= 0) return 0;
  if (optionPool <= 0) return stake;
  const nextPool = pool + stake;
  const nextOptionPool = optionPool + stake;
  return Math.max(stake, Math.round((stake / nextOptionPool) * nextPool));
}

export function accuracyPercent(won: number, lost: number): number {
  const total = won + lost;
  if (total === 0) return 0;
  return Math.round((won / total) * 100);
}
