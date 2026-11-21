"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppState,
  Campus,
  Market,
  MarketCategory,
  Report,
  ReportStatus,
  Student,
  Vote,
} from "./types";
import { buildSeedState, newMatchId } from "./seed";
import { uid } from "./utils";
import { Logo } from "@/components/Logo";

const STORAGE_KEY = "socialhub.state.v1";

export interface ToastMessage {
  id: string;
  message: string;
  kind: "success" | "info" | "error";
}

export interface CreateMarketInput {
  question: string;
  description: string;
  category: MarketCategory;
  campus: Campus | "All";
  options: string[];
  closesInHours: number;
}

export interface ReportInput {
  targetStudentId?: string | null;
  targetMarketId?: string | null;
  reason: string;
  details: string;
}

export interface StoreValue {
  state: AppState;
  currentUser: Student;
  toasts: ToastMessage[];
  notify: (message: string, kind?: ToastMessage["kind"]) => void;
  dismissToast: (id: string) => void;
  login: (studentId: string) => void;
  logout: () => void;
  swipe: (targetId: string, direction: "like" | "pass") => string | null;
  sendMessage: (matchId: string, text: string) => void;
  receiveMessage: (matchId: string, text: string) => void;
  markRead: (matchId: string) => void;
  setActiveMatch: (matchId: string | null) => void;
  createMarket: (input: CreateMarketInput) => string;
  placeVote: (marketId: string, optionId: string, stake: number) => boolean;
  resolveMarket: (marketId: string, optionId: string) => void;
  submitReport: (input: ReportInput) => void;
  reviewReport: (reportId: string, status: ReportStatus, note?: string) => void;
  setVerified: (studentId: string, verified: boolean) => void;
  updateProfile: (patch: Partial<Student>) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return buildSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.students?.length || !parsed?.markets?.length) {
      return buildSeedState();
    }
    return parsed;
  } catch {
    return buildSeedState();
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const activeMatchId = useRef<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — the demo keeps running in memory */
    }
  }, [state]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastMessage["kind"] = "success") => {
      const id = uid("toast");
      setToasts((prev) => [...prev.slice(-2), { id, message, kind }]);
      timers.current[id] = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        delete timers.current[id];
      }, 3200);
    },
    [],
  );

  const mutate = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  }, []);

  const updateStudent = useCallback(
    (
      prev: AppState,
      studentId: string,
      patch: (student: Student) => Student,
    ): AppState => ({
      ...prev,
      students: prev.students.map((student) =>
        student.id === studentId ? patch(student) : student,
      ),
    }),
    [],
  );

  const value = useMemo<StoreValue | null>(() => {
    if (!state) return null;

    const currentUser =
      state.students.find((student) => student.id === state.currentUserId) ??
      state.students[0];

    return {
      state,
      currentUser,
      toasts,
      notify,
      dismissToast,

      login: (studentId) => {
        mutate((prev) => ({ ...prev, currentUserId: studentId }));
        const target = state.students.find((student) => student.id === studentId);
        notify(
          target?.role === "admin"
            ? `Masuk sebagai admin ${target.name}`
            : `Selamat datang, ${target?.name ?? "mahasiswa"}!`,
          "info",
        );
      },

      logout: () => {
        mutate((prev) => ({ ...prev, currentUserId: null }));
        activeMatchId.current = null;
        notify("Kamu sudah keluar dari akun demo.", "info");
      },

      swipe: (targetId, direction) => {
        const now = new Date().toISOString();
        const existing = state.swipes.find(
          (swipe) => swipe.fromId === currentUser.id && swipe.toId === targetId,
        );
        if (existing) {
          mutate((prev) => ({
            ...prev,
            swipes: prev.swipes.map((swipe) =>
              swipe === existing ? { ...swipe, direction } : swipe,
            ),
          }));
        } else {
          mutate((prev) => ({
            ...prev,
            swipes: [
              ...prev.swipes,
              {
                fromId: currentUser.id,
                toId: targetId,
                direction,
                createdAt: now,
              },
            ],
          }));
        }

        if (direction !== "like") return null;

        const mutual = state.swipes.some(
          (swipe) =>
            swipe.fromId === targetId &&
            swipe.toId === currentUser.id &&
            swipe.direction === "like",
        );
        if (!mutual) return null;

        const matchId = newMatchId([currentUser.id, targetId]);
        if (state.matches.some((match) => match.id === matchId)) return matchId;

        mutate((prev) => ({
          ...prev,
          matches: [
            ...prev.matches,
            {
              id: matchId,
              studentIds: [currentUser.id, targetId],
              createdAt: now,
              unread: 0,
            },
          ],
        }));
        return matchId;
      },

      sendMessage: (matchId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        mutate((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: uid("msg"),
              matchId,
              senderId: currentUser.id,
              text: trimmed,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      receiveMessage: (matchId, text) => {
        const isOpen = activeMatchId.current === matchId;
        mutate((prev) => {
          const match = prev.matches.find((item) => item.id === matchId);
          const partnerId =
            match?.studentIds.find((id) => id !== currentUser.id) ?? "";
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: uid("msg"),
                matchId,
                senderId: partnerId,
                text,
                createdAt: new Date().toISOString(),
              },
            ],
            matches: prev.matches.map((item) =>
              item.id === matchId
                ? { ...item, unread: isOpen ? 0 : item.unread + 1 }
                : item,
            ),
          };
        });
      },

      markRead: (matchId) => {
        if (state.matches.find((match) => match.id === matchId)?.unread === 0) {
          return;
        }
        mutate((prev) => ({
          ...prev,
          matches: prev.matches.map((match) =>
            match.id === matchId ? { ...match, unread: 0 } : match,
          ),
        }));
      },

      setActiveMatch: (matchId) => {
        activeMatchId.current = matchId;
      },

      createMarket: (input) => {
        const id = `m_user_${uid("x")}`;
        const market: Market = {
          id,
          question: input.question.trim(),
          description: input.description.trim(),
          category: input.category,
          campus: input.campus,
          options: input.options
            .map((label) => label.trim())
            .filter(Boolean)
            .map((label) => ({ id: uid("opt"), label })),
          createdAt: new Date().toISOString(),
          closesAt: new Date(
            Date.now() + input.closesInHours * 3600 * 1000,
          ).toISOString(),
          createdBy: currentUser.id,
          resolvedOptionId: null,
          resolvedAt: null,
        };

        mutate((prev) => {
          const withMarket: AppState = {
            ...prev,
            markets: [market, ...prev.markets],
          };
          return updateStudent(withMarket, currentUser.id, (student) => ({
            ...student,
            points: student.points + 10,
            reputation: student.reputation + 10,
            stats: {
              ...student.stats,
              marketsCreated: student.stats.marketsCreated + 1,
            },
          }));
        });
        notify("Prediksi baru dibuat. +10 reputation points!");
        return id;
      },

      placeVote: (marketId, optionId, stake) => {
        const market = state.markets.find((item) => item.id === marketId);
        if (!market) return false;
        if (new Date(market.closesAt).getTime() <= Date.now()) {
          notify("Prediksi ini sudah ditutup.", "error");
          return false;
        }
        const previous = state.votes.find(
          (vote) =>
            vote.marketId === marketId && vote.studentId === currentUser.id,
        );
        const refund = previous?.stake ?? 0;
        if (currentUser.points + refund < stake) {
          notify("Poin kamu tidak cukup untuk taruhan ini.", "error");
          return false;
        }

        mutate((prev) => {
          const withoutPrevious = prev.votes.filter(
            (vote) =>
              !(vote.marketId === marketId && vote.studentId === currentUser.id),
          );
          const next: AppState = {
            ...prev,
            votes: [
              ...withoutPrevious,
              {
                id: uid("v"),
                marketId,
                studentId: currentUser.id,
                optionId,
                stake,
                createdAt: new Date().toISOString(),
                payout: null,
                outcome: "pending",
              },
            ],
          };
          return updateStudent(next, currentUser.id, (student) => ({
            ...student,
            points: student.points + refund - stake,
            stats: {
              ...student.stats,
              votesCast: student.stats.votesCast + (previous ? 0 : 1),
            },
          }));
        });

        const label =
          market.options.find((option) => option.id === optionId)?.label ?? "";
        notify(
          previous
            ? `Prediksi diperbarui: ${label}`
            : `Prediksi tersimpan: ${label}`,
        );
        return true;
      },

      resolveMarket: (marketId, optionId) => {
        const market = state.markets.find((item) => item.id === marketId);
        if (!market || market.resolvedOptionId) return;
        const marketVotes = state.votes.filter(
          (vote) => vote.marketId === marketId,
        );
        const winnerPool = marketVotes
          .filter((vote) => vote.optionId === optionId)
          .reduce((sum, vote) => sum + vote.stake, 0);
        const pool = marketVotes.reduce((sum, vote) => sum + vote.stake, 0);
        const resolvedAt = new Date().toISOString();

        mutate((prev) => {
          const payouts = new Map<string, number>();
          const nextVotes: Vote[] = prev.votes.map((vote) => {
            if (vote.marketId !== marketId || vote.outcome !== "pending") {
              return vote;
            }
            const won = vote.optionId === optionId;
            const payout =
              won && winnerPool > 0
                ? Math.max(
                    vote.stake,
                    Math.round((vote.stake / winnerPool) * pool),
                  )
                : 0;
            if (won && payout > 0) {
              payouts.set(
                vote.studentId,
                (payouts.get(vote.studentId) ?? 0) + payout,
              );
            }
            return {
              ...vote,
              outcome: won ? "won" : "lost",
              payout: won ? payout : 0,
            };
          });

          return {
            ...prev,
            votes: nextVotes,
            markets: prev.markets.map((item) =>
              item.id === marketId
                ? { ...item, resolvedOptionId: optionId, resolvedAt }
                : item,
            ),
            students: prev.students.map((student) => {
              const settled = nextVotes.filter(
                (vote) =>
                  vote.studentId === student.id &&
                  vote.marketId === marketId &&
                  vote.outcome !== "pending",
              );
              if (settled.length === 0) return student;
              const won = settled.filter((vote) => vote.outcome === "won").length;
              const lost = settled.filter((vote) => vote.outcome === "lost").length;
              const payout = payouts.get(student.id) ?? 0;
              return {
                ...student,
                points: student.points + payout,
                reputation: student.reputation + payout,
                stats: {
                  ...student.stats,
                  votesWon: student.stats.votesWon + won,
                  votesLost: student.stats.votesLost + lost,
                },
              };
            }),
          };
        });
        notify("Hasil prediksi divalidasi dan poin dibagikan ke pemenang.");
      },

      submitReport: (input) => {
        const report: Report = {
          id: uid("rep"),
          reporterId: currentUser.id,
          targetStudentId: input.targetStudentId ?? null,
          targetMarketId: input.targetMarketId ?? null,
          reason: input.reason,
          details: input.details.trim(),
          status: "open",
          createdAt: new Date().toISOString(),
          reviewNote: null,
        };
        mutate((prev) => ({ ...prev, reports: [report, ...prev.reports] }));
        notify("Laporan terkirim ke admin untuk ditinjau.", "info");
      },

      reviewReport: (reportId, status, note) => {
        mutate((prev) => ({
          ...prev,
          reports: prev.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                  reviewNote: note?.trim() ? note.trim() : report.reviewNote,
                }
              : report,
          ),
        }));
        notify(
          status === "dismissed"
            ? "Laporan ditolak dan diarsipkan."
            : "Laporan diperbarui.",
          status === "dismissed" ? "info" : "success",
        );
      },

      setVerified: (studentId, verified) => {
        const target = state.students.find((student) => student.id === studentId);
        mutate((prev) =>
          updateStudent(prev, studentId, (student) => ({ ...student, verified })),
        );
        notify(
          verified
            ? `Akun ${target?.name ?? "mahasiswa"} diverifikasi.`
            : `Verifikasi ${target?.name ?? "mahasiswa"} dicabut.`,
          "info",
        );
      },

      updateProfile: (patch) => {
        mutate((prev) =>
          updateStudent(prev, currentUser.id, (student) => ({
            ...student,
            ...patch,
            id: student.id,
            role: student.role,
            stats: student.stats,
          })),
        );
        notify("Profil berhasil diperbarui.");
      },

      resetDemo: () => {
        setState(buildSeedState());
        activeMatchId.current = null;
        notify("Data demo dikembalikan ke kondisi awal.", "info");
      },
    };
  }, [state, toasts, notify, dismissToast, mutate, updateStudent]);

  if (!value) return <StoreSplash />;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore harus dipakai di dalam AppStoreProvider");
  }
  return context;
}

function StoreSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <Logo height={80} priority />
      <div className="text-center">
        <p className="eyebrow">Social Hub</p>
        <p className="text-xs text-[var(--muted)]">
          Memuat ekosistem kampus Kemang &amp; Sudirman…
        </p>
      </div>
      <div className="skeleton h-2 w-44 rounded-full" />
    </div>
  );
}
