import type {
  ActivityItem,
  AppState,
  Market,
  MarketStatus,
  MarketTotals,
  Student,
} from "./types";
import {
  accuracyPercent,
  computeTotals,
  formatNumber,
  formatRelative,
  marketStatus,
} from "./utils";

export { computeTotals, marketStatus };

export function findStudent(
  state: AppState,
  studentId: string | null | undefined,
): Student | undefined {
  if (!studentId) return undefined;
  return state.students.find((student) => student.id === studentId);
}

export function studentName(state: AppState, studentId: string): string {
  return findStudent(state, studentId)?.name ?? "Mahasiswa";
}

export function currentUser(state: AppState): Student {
  return findStudent(state, state.currentUserId) ?? state.students[0];
}

export function swipedStudentIds(state: AppState): Set<string> {
  return new Set(
    state.swipes
      .filter((swipe) => swipe.fromId === state.currentUserId)
      .map((swipe) => swipe.toId),
  );
}

/** Students the current user has not swiped yet. */
export function discoverQueue(state: AppState): Student[] {
  const seen = swipedStudentIds(state);
  return state.students.filter(
    (student) => student.id !== state.currentUserId && !seen.has(student.id),
  );
}

export interface MatchSummary {
  id: string;
  partner: Student;
  createdAt: string;
  unread: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

export function matchSummaries(state: AppState): MatchSummary[] {
  const me = state.currentUserId;
  const summaries: MatchSummary[] = [];

  for (const match of state.matches) {
    const partnerId = match.studentIds.find((id) => id !== me) ?? "";
    const partner = findStudent(state, partnerId);
    if (!partner) continue;
    const messages = state.messages
      .filter((message) => message.matchId === match.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const last = messages[messages.length - 1];
    summaries.push({
      id: match.id,
      partner,
      createdAt: match.createdAt,
      unread: match.unread,
      lastMessage: last?.text ?? null,
      lastMessageAt: last?.createdAt ?? null,
    });
  }

  return summaries.sort((a, b) =>
    (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt),
  );
}

export function findMatch(state: AppState, matchId: string) {
  return state.matches.find((match) => match.id === matchId) ?? null;
}

export function unreadTotal(state: AppState): number {
  return state.matches.reduce((sum, match) => sum + match.unread, 0);
}

export function myVote(state: AppState, marketId: string) {
  return state.votes.find(
    (vote) =>
      vote.marketId === marketId && vote.studentId === state.currentUserId,
  );
}

export function totalsFor(state: AppState, marketId: string): MarketTotals {
  return computeTotals(state.votes, marketId);
}

export function statusOf(market: Market): MarketStatus {
  return marketStatus(market);
}

export function sortedMarkets(state: AppState): Market[] {
  const weight: Record<MarketStatus, number> = {
    "closing-soon": 0,
    open: 1,
    closed: 2,
    resolved: 3,
  };
  return [...state.markets].sort((a, b) => {
    const diff = weight[marketStatus(a)] - weight[marketStatus(b)];
    if (diff !== 0) return diff;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function trendingMarkets(state: AppState, limit = 3): Market[] {
  return [...state.markets]
    .filter((market) => !market.resolvedOptionId)
    .sort((a, b) => totalsFor(state, b.id).pool - totalsFor(state, a.id).pool)
    .slice(0, limit);
}

export function suggestedStudents(state: AppState, limit = 3): Student[] {
  const me = currentUser(state);
  const swiped = swipedStudentIds(state);
  return state.students
    .filter((student) => student.id !== me.id && !swiped.has(student.id))
    .map((student) => {
      const shared = student.interests.filter((interest) =>
        me.interests.includes(interest),
      ).length;
      const sameCampus = student.campus === me.campus ? 1 : 0;
      return { student, score: shared * 2 + sameCampus };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.student);
}

export interface LeaderRow {
  student: Student;
  accuracy: number;
  resolvedVotes: number;
  volume: number;
}

export function leaderboard(state: AppState): {
  byReputation: LeaderRow[];
  byAccuracy: LeaderRow[];
  byVolume: LeaderRow[];
} {
  const rows: LeaderRow[] = state.students.map((student) => {
    const won = student.stats.votesWon;
    const lost = student.stats.votesLost;
    const volume = state.votes
      .filter((vote) => vote.studentId === student.id)
      .reduce((sum, vote) => sum + vote.stake, 0);
    return {
      student,
      accuracy: accuracyPercent(won, lost),
      resolvedVotes: won + lost,
      volume,
    };
  });

  return {
    byReputation: [...rows].sort(
      (a, b) => b.student.reputation - a.student.reputation,
    ),
    byAccuracy: [...rows].sort((a, b) => {
      if (a.resolvedVotes < 3 && b.resolvedVotes >= 3) return 1;
      if (b.resolvedVotes < 3 && a.resolvedVotes >= 3) return -1;
      return (
        b.accuracy - a.accuracy ||
        b.student.reputation - a.student.reputation
      );
    }),
    byVolume: [...rows].sort((a, b) => b.volume - a.volume),
  };
}

export function myRank(state: AppState): number {
  const rows = leaderboard(state).byReputation;
  const index = rows.findIndex((row) => row.student.id === state.currentUserId);
  return index === -1 ? rows.length : index + 1;
}

export function activityFeed(state: AppState, limit = 6): ActivityItem[] {
  const items: ActivityItem[] = [];
  const me = state.currentUserId;

  for (const match of state.matches) {
    const partner = findStudent(
      state,
      match.studentIds.find((id) => id !== me) ?? null,
    );
    if (!partner) continue;
    items.push({
      id: `act_match_${match.id}`,
      icon: "match",
      text: `Match baru dengan ${partner.name} — ${partner.program}`,
      at: match.createdAt,
    });
  }

  for (const vote of state.votes.filter((item) => item.studentId === me)) {
    const market = state.markets.find((item) => item.id === vote.marketId);
    if (!market) continue;
    const option = market.options.find((item) => item.id === vote.optionId);
    items.push({
      id: `act_vote_${vote.id}`,
      icon: vote.outcome === "won" ? "won" : "vote",
      text:
        vote.outcome === "won"
          ? `Prediksimu "${option?.label}" benar — +${formatNumber(
              vote.payout ?? 0,
            )} poin`
          : `Kamu memprediksi "${option?.label}" di ${market.question}`,
      at: vote.createdAt,
    });
  }

  for (const market of state.markets.filter(
    (item) => item.createdBy === me && item.resolvedOptionId === null,
  )) {
    items.push({
      id: `act_market_${market.id}`,
      icon: "market",
      text: `Prediksi yang kamu buat: ${market.question}`,
      at: market.createdAt,
    });
  }

  if (currentUser(state).role === "admin") {
    for (const report of state.reports.filter((item) => item.status === "open")) {
      items.push({
        id: `act_report_${report.id}`,
        icon: "report",
        text: `Laporan baru menunggu tinjauan: ${report.reason}`,
        at: report.createdAt,
      });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export function relativeTime(iso: string): string {
  return formatRelative(iso);
}

export function marketsAwaitingValidation(state: AppState): Market[] {
  return state.markets.filter(
    (market) => !market.resolvedOptionId && marketStatus(market) === "closed",
  );
}
