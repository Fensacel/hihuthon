"use client";

import Link from "next/link";
import { Avatar, Badge, EmptyState, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { matchSummaries } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

export default function MatchesPage() {
  const { state } = useStore();
  const matches = matchSummaries(state);
  const unread = matches.reduce((sum, match) => sum + match.unread, 0);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="chat"
        title="Chat"
        subtitle={`${matches.length} match tersimpan`}
        action={
          unread > 0 ? (
            <Badge tone="danger" icon="chat">
              {unread} belum dibaca
            </Badge>
          ) : (
            <Badge tone="neutral" icon="check">
              Semua terbaca
            </Badge>
          )
        }
      />

      {matches.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Belum ada match"
          description="Swipe di halaman Discover. Kamu akan otomatis cocok dengan mahasiswa yang lebih dulu menyukai profilmu."
          action={
            <Link href="/discover" className="btn btn-primary">
              <Icon name="heart" size={16} />
              Buka Discover
            </Link>
          }
        />
      ) : (
        <ul className="card divide-y divide-[var(--line)] overflow-hidden">
          {matches.map((match) => (
            <li key={match.id}>
              <Link
                href={`/chat/${match.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--background)]"
              >
                <Avatar
                  name={match.partner.name}
                  hue={match.partner.avatarHue}
                  size={48}
                  verified={match.partner.verified}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">
                      {match.partner.name}
                    </span>
                    <Badge tone="neutral">{match.partner.campus}</Badge>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                    {match.lastMessage ??
                      "Belum ada pesan — mulai percakapan sekarang."}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-[var(--muted)]">
                    {formatRelative(match.lastMessageAt ?? match.createdAt)}
                  </span>
                  {match.unread > 0 ? (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {match.unread}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
