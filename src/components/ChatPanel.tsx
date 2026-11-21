"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Badge } from "./ui";
import { Icon } from "./Icon";
import { findMatch, findStudent } from "@/lib/selectors";
import { replyFor } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

const QUICK_REPLIES = [
  "Hai! Apa kabar?",
  "Mau belajar bareng minggu ini?",
  "Kamu ikut acara kampus terdekat?",
];

export function ChatPanel({ matchId }: { matchId: string }) {
  const {
    state,
    currentUser,
    sendMessage,
    receiveMessage,
    markRead,
    setActiveMatch,
  } = useStore();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const api = useRef({ markRead, setActiveMatch });

  const match = useMemo(() => findMatch(state, matchId), [state, matchId]);
  const partner = useMemo(
    () =>
      findStudent(
        state,
        match?.studentIds.find((id) => id !== currentUser.id) ?? null,
      ),
    [state, match, currentUser.id],
  );
  const messages = useMemo(
    () =>
      state.messages
        .filter((message) => message.matchId === matchId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [state.messages, matchId],
  );

  useEffect(() => {
    api.current = { markRead, setActiveMatch };
  }, [markRead, setActiveMatch]);

  useEffect(() => {
    api.current.setActiveMatch(matchId);
    api.current.markRead(matchId);
    return () => api.current.setActiveMatch(null);
  }, [matchId]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || !partner) return;
    sendMessage(matchId, value);
    setDraft("");
    const timer = setTimeout(() => {
      receiveMessage(matchId, replyFor(value, partner.name));
    }, 1400);
    timers.current.push(timer);
  };

  if (!match || !partner) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--muted)]">
        Percakapan tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="card flex h-[calc(100vh-11rem)] flex-col overflow-hidden lg:h-[calc(100vh-9rem)]">
      <header className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
        <Avatar name={partner.name} hue={partner.avatarHue} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{partner.name}</p>
          <p className="text-[11px] text-[var(--muted)]">
            {partner.program} · Kampus {partner.campus}
          </p>
        </div>
        <Badge tone="success" icon="sparkles">
          Match
        </Badge>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-[11px] text-[var(--muted)]">
          Kalian terhubung karena saling menyukai profil.
        </p>
        {messages.map((message) => {
          const mine = message.senderId === currentUser.id;
          return (
            <div
              key={message.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-[var(--radius-card)] px-3.5 py-2.5 text-sm",
                  mine
                    ? "rounded-br-md bg-[var(--blue)] text-white"
                    : "rounded-bl-md border border-[var(--line)] bg-[var(--surface)]",
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    mine ? "text-white/70" : "text-[var(--muted)]",
                  )}
                >
                  {formatClock(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--line)] px-3 pt-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              className="chip shrink-0"
              onClick={() => send(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      <form
        className="flex items-center gap-2 px-3 pb-3"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <input
          className="input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Tulis pesan untuk ${partner.name.split(" ")[0]}…`}
          aria-label="Pesan"
        />
        <button
          type="submit"
          className="btn btn-primary h-10 w-10 shrink-0 p-0"
          disabled={draft.trim().length === 0}
          aria-label="Kirim pesan"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
