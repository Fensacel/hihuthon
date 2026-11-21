/**
 * Domain types for SocialHub — Campus Social & Prediction Platform.
 * Hackathon MVP: everything runs client-side with a localStorage-backed store.
 */

export type Campus = "Kemang" | "Sudirman";

export type StudentGoal = "Friends" | "Study Buddy" | "Networking" | "Dating";

export type StudentRole = "student" | "admin";

export interface StudentStats {
  /** Total predictions voted on (including unresolved ones). */
  votesCast: number;
  /** Predictions that were resolved and won. */
  votesWon: number;
  /** Predictions that were resolved and lost. */
  votesLost: number;
  /** Prediction markets created by this student. */
  marketsCreated: number;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  program: string;
  /** Angkatan, e.g. 2023 */
  batch: number;
  campus: Campus;
  bio: string;
  interests: string[];
  goals: StudentGoal[];
  /** Virtual reputation points balance. Never real currency. */
  points: number;
  /** Cumulative reputation earned (used for leaderboard ranking). */
  reputation: number;
  verified: boolean;
  role: StudentRole;
  stats: StudentStats;
  /** Avatar palette index, used to render the gradient+initials avatar. */
  avatarHue: number;
}

export interface Swipe {
  fromId: string;
  toId: string;
  direction: "like" | "pass";
  createdAt: string;
}

export interface Match {
  id: string;
  studentIds: [string, string];
  createdAt: string;
  /** Unread messages for the current user. */
  unread: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export type MarketCategory =
  | "Sports"
  | "Campus Event"
  | "Academic"
  | "Community"
  | "Fun";

export interface MarketOption {
  id: string;
  label: string;
}

export interface Market {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  campus: Campus | "All";
  options: MarketOption[];
  /** ISO date. Market stops accepting votes after this. */
  closesAt: string;
  createdAt: string;
  /** Student id of the creator. */
  createdBy: string;
  /** Set by admin validation when the outcome is confirmed. */
  resolvedOptionId: string | null;
  resolvedAt: string | null;
}

export interface Vote {
  id: string;
  marketId: string;
  studentId: string;
  optionId: string;
  /** Points staked on this option (virtual only). */
  stake: number;
  createdAt: string;
  /** Payout credited after resolution. */
  payout: number | null;
  outcome: "pending" | "won" | "lost";
}

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterId: string;
  /** Student being reported, when the report targets a profile. */
  targetStudentId: string | null;
  /** Market being reported, when the report targets a prediction. */
  targetMarketId: string | null;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  reviewNote: string | null;
}

export interface ActivityItem {
  id: string;
  icon: "match" | "vote" | "won" | "market" | "report";
  text: string;
  at: string;
}

export interface AppState {
  currentUserId: string | null;
  students: Student[];
  swipes: Swipe[];
  matches: Match[];
  messages: Message[];
  markets: Market[];
  votes: Vote[];
  reports: Report[];
  /** Last time the demo data was (re)generated. */
  seededAt: string;
}

export type MarketStatus = "open" | "closing-soon" | "closed" | "resolved";

export interface MarketTotals {
  /** Points staked per option id. */
  optionStakes: Record<string, number>;
  /** Total points staked on the market. */
  pool: number;
  /** Number of votes cast. */
  voters: number;
  /** Share (0-100) per option id. */
  optionPercents: Record<string, number>;
  /** Option id with the largest pool, null when nobody voted. */
  leadingOptionId: string | null;
}
