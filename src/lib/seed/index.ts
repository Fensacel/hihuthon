import type {
  AppState,
  Market,
  Match,
  Message,
  Report,
  Student,
  Swipe,
  Vote,
} from "../types";
import {
  hashString,
  hoursFromNow,
  minutesFromNow,
  mulberry32,
  uid,
} from "../utils";
import { CATEGORY_OPTIONS, marketSeeds, type MarketSeed } from "./markets";
import { CURRENT_USER_ID, INCOMING_LIKES, STUDENTS } from "./students";

export { CURRENT_USER_ID, INCOMING_LIKES, STUDENTS, CATEGORY_OPTIONS };
export type { MarketSeed };

const VOTE_STAKES = [5, 10, 15, 20, 25, 30, 40, 50];

function buildMarket(seed: MarketSeed): Market {
  return {
    id: seed.id,
    question: seed.question,
    description: seed.description,
    category: seed.category,
    campus: seed.campus,
    options: seed.options,
    createdAt: hoursFromNow(-seed.createdHoursAgo),
    closesAt: hoursFromNow(seed.closesInHours),
    createdBy: seed.id === "m_campusfest_100" ? "s_nadia" : "s_yoga",
    resolvedOptionId: seed.resolvedOptionId,
    resolvedAt: seed.resolvedOptionId ? hoursFromNow(-24) : null,
  };
}

/** Spread a seeded pool of stakes across the market options. */
function buildVotes(
  seed: MarketSeed,
  students: Student[],
  market: Market,
): Vote[] {
  const random = mulberry32(hashString(seed.id));
  const voters = students.filter((student) => student.id !== CURRENT_USER_ID);
  const weightTotal = seed.weights.reduce((sum, value) => sum + value, 0);
  const closesAt = new Date(market.closesAt).getTime();
  const createdAt = new Date(market.createdAt).getTime();
  const windowEnd = Math.max(createdAt + 1, Math.min(Date.now(), closesAt));

  const votes: Vote[] = [];

  market.options.forEach((option, index) => {
    const share = (seed.pool * seed.weights[index]) / weightTotal;
    let staked = 0;
    let guard = 0;

    while (staked < share && guard < 40) {
      guard += 1;
      const voter = voters[Math.floor(random() * voters.length)];
      if (
        votes.some(
          (vote) =>
            vote.marketId === market.id && vote.studentId === voter.id,
        )
      ) {
        continue;
      }
      const stake = VOTE_STAKES[Math.floor(random() * VOTE_STAKES.length)];
      staked += stake;
      const at = createdAt + random() * (windowEnd - createdAt);
      const won = market.resolvedOptionId
        ? market.resolvedOptionId === option.id
        : null;
      votes.push({
        id: uid("v"),
        marketId: market.id,
        studentId: voter.id,
        optionId: option.id,
        stake,
        createdAt: new Date(at).toISOString(),
        payout: null,
        outcome: won === null ? "pending" : won ? "won" : "lost",
      });
    }
  });

  if (market.resolvedOptionId) {
    const winnerPool = votes
      .filter((vote) => vote.optionId === market.resolvedOptionId)
      .reduce((sum, vote) => sum + vote.stake, 0);
    const pool = votes.reduce((sum, vote) => sum + vote.stake, 0);
    return votes.map((vote) => ({
      ...vote,
      payout:
        vote.outcome === "won" && winnerPool > 0
          ? Math.round((vote.stake / winnerPool) * pool)
          : vote.outcome === "lost"
            ? 0
            : null,
    }));
  }

  // Guarantee at least one vote so a new market never looks empty.
  const creator = voters[Math.floor(random() * voters.length)];
  const firstOption = market.options[0].id;
  if (!votes.some((vote) => vote.studentId === creator.id)) {
    votes.push({
      id: uid("v"),
      marketId: market.id,
      studentId: creator.id,
      optionId: firstOption,
      stake: 10,
      createdAt: market.createdAt,
      payout: null,
      outcome: "pending",
    });
  }

  return votes;
}

function buildSwipes(now: number): Swipe[] {
  const incoming: Swipe[] = INCOMING_LIKES.map((studentId, index) => ({
    fromId: studentId,
    toId: CURRENT_USER_ID,
    direction: "like" as const,
    createdAt: hoursFromNow(-(30 - index * 3), now),
  }));

  const outgoing: Swipe[] = [
    {
      fromId: CURRENT_USER_ID,
      toId: "s_ayla",
      direction: "like",
      createdAt: hoursFromNow(-26, now),
    },
    {
      fromId: CURRENT_USER_ID,
      toId: "s_bimo",
      direction: "like",
      createdAt: hoursFromNow(-20, now),
    },
    {
      fromId: CURRENT_USER_ID,
      toId: "s_fajar",
      direction: "pass",
      createdAt: hoursFromNow(-18, now),
    },
    {
      fromId: CURRENT_USER_ID,
      toId: "s_arif",
      direction: "pass",
      createdAt: hoursFromNow(-15, now),
    },
  ];

  return [...incoming, ...outgoing];
}

function buildMatches(now: number): Match[] {
  return [
    {
      id: "match_ayla",
      studentIds: [CURRENT_USER_ID, "s_ayla"],
      createdAt: hoursFromNow(-26, now),
      unread: 1,
    },
    {
      id: "match_bimo",
      studentIds: [CURRENT_USER_ID, "s_bimo"],
      createdAt: hoursFromNow(-20, now),
      unread: 0,
    },
  ];
}

function buildMessages(now: number): Message[] {
  return [
    {
      id: "msg_1",
      matchId: "match_ayla",
      senderId: "s_ayla",
      text: "Hai Raka! Kita satu kampus ya. Kamu ikut lomba UI/UX juga?",
      createdAt: hoursFromNow(-25, now),
    },
    {
      id: "msg_2",
      matchId: "match_ayla",
      senderId: CURRENT_USER_ID,
      text: "Hai Ayla! Iya, aku lagi cari tim buat lomba bulan depan.",
      createdAt: hoursFromNow(-24, now),
    },
    {
      id: "msg_3",
      matchId: "match_ayla",
      senderId: "s_ayla",
      text: "Sama dong. Boleh bahas brief-nya bareng minggu ini?",
      createdAt: hoursFromNow(-2, now),
    },
    {
      id: "msg_4",
      matchId: "match_bimo",
      senderId: "s_bimo",
      text: "Raka, kamu ikut futsal Cakrawala Arena? Tim kami butuh pemain tambahan.",
      createdAt: hoursFromNow(-19, now),
    },
    {
      id: "msg_5",
      matchId: "match_bimo",
      senderId: CURRENT_USER_ID,
      text: "Boleh! Latihan Selasa jam 5 sore di lapangan Kemang, ya.",
      createdAt: hoursFromNow(-18, now),
    },
  ];
}

function buildReports(now: number): Report[] {
  return [
    {
      id: "rep_1",
      reporterId: "s_fajar",
      targetStudentId: null,
      targetMarketId: "m_bem_ketua",
      reason: "Pertanyaan tidak jelas",
      details:
        "Opsi kandidat tidak menyertakan nomor urut sehingga sulit diprediksi anggota baru.",
      status: "open",
      createdAt: hoursFromNow(-7, now),
      reviewNote: null,
    },
    {
      id: "rep_2",
      reporterId: "s_kirana",
      targetStudentId: "s_dimas",
      targetMarketId: null,
      reason: "Profil tidak sesuai",
      details:
        "Program studi pada profil berbeda dengan data kelas yang saya ketahui.",
      status: "reviewing",
      createdAt: hoursFromNow(-14, now),
      reviewNote: null,
    },
    {
      id: "rep_3",
      reporterId: "s_melati",
      targetStudentId: "s_arif",
      targetMarketId: null,
      reason: "Konten tidak sopan",
      details: "Salah satu foto kegiatan di profil terlihat tidak pantas.",
      status: "open",
      createdAt: hoursFromNow(-3, now),
      reviewNote: null,
    },
  ];
}

export function buildSeedState(now: number = Date.now()): AppState {
  const seeds = marketSeeds();
  const markets = seeds.map(buildMarket);
  const votes = seeds.flatMap((seed, index) =>
    buildVotes(seed, STUDENTS, markets[index]),
  );

  return {
    currentUserId: CURRENT_USER_ID,
    students: STUDENTS.map((student) => ({ ...student })),
    swipes: buildSwipes(now),
    matches: buildMatches(now),
    messages: buildMessages(now),
    markets,
    votes,
    reports: buildReports(now),
    seededAt: new Date(now).toISOString(),
  };
}

export function newMatchId(studentIds: [string, string]): string {
  const [a, b] = studentIds.map((id) => id.replace("s_", ""));
  return [a, b].sort().join("__");
}

export function replyFor(text: string, name: string): string {
  const lower = text.toLowerCase();
  const first = name.split(" ")[0];
  if (/(tugas|belajar|study|ujian|uts|uas|presentasi|kelompok|proposal)/.test(lower)) {
    return `Boleh banget. Kapan kita mulai? Aku paling senggang setelah kelas sore.`;
  }
  if (/(lomba|kompetisi|tim|turnamen|futsal|basket|latihan)/.test(lower)) {
    return "Aku tertarik! Nanti kubagikan jadwal dan linimasa lombanya ya.";
  }
  if (/(kantin|kopi|makan|nongkrong|jajan|sore|kumpul)/.test(lower)) {
    return "Setuju, ketemu di kantin kampus jam 4 sore aja?";
  }
  if (/(hai|halo|hello|pagi|siang|malam|kenal)/.test(lower)) {
    return `Hai juga! Senang akhirnya bisa ngobrol, aku ${first}.`;
  }
  return "Menarik! Boleh cerita lebih lanjut? Kita bahas sambil ngopi di kampus, yuk.";
}

export const REPORT_REASONS: string[] = [
  "Profil tidak sesuai",
  "Konten tidak sopan",
  "Spam atau promosi",
  "Pertanyaan tidak jelas",
  "Hasil prediksi tidak valid",
  "Lainnya",
];
