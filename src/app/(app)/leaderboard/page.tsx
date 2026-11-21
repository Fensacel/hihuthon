"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Badge, SectionHeader, StatTile } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { activityFeed, leaderboard, myRank } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { accuracyPercent, cn, formatNumber, formatRelative } from "@/lib/utils";

type BoardKey = "byReputation" | "byAccuracy" | "byVolume";

const TABS: Array<{ key: BoardKey; label: string; icon: IconName }> = [
  { key: "byReputation", label: "Reputasi", icon: "star" },
  { key: "byAccuracy", label: "Akurasi", icon: "target" },
  { key: "byVolume", label: "Volume", icon: "coins" },
];

const ACTIVITY_ICON: Record<string, IconName> = {
  match: "heart",
  vote: "target",
  won: "trophy",
  market: "pulse",
  report: "flag",
};

export default function LeaderboardPage() {
  const { state, currentUser } = useStore();
  const [tab, setTab] = useState<BoardKey>("byReputation");

  const boards = useMemo(() => leaderboard(state), [state]);
  const rows = boards[tab];
  const rank = myRank(state);
  const feed = activityFeed(state, 5);
  const myVolume = state.votes
    .filter((vote) => vote.studentId === currentUser.id)
    .reduce((sum, vote) => sum + vote.stake, 0);

  const metric = (index: number) => {
    const row = rows[index];
    if (tab === "byAccuracy") {
      return `${row.accuracy}% · ${row.resolvedVotes} selesai`;
    }
    if (tab === "byVolume") return `${formatNumber(row.volume)} poin`;
    return `${formatNumber(row.student.reputation)} reputasi`;
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="trophy"
        title="Peringkat"
        subtitle="Mahasiswa dengan reputasi, akurasi, dan volume prediksi terbaik"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Peringkatmu"
          value={`#${rank}`}
          hint={`dari ${state.students.length} mahasiswa`}
          icon="trophy"
          tone="warn"
        />
        <StatTile
          label="Reputasi"
          value={formatNumber(currentUser.reputation)}
          hint="Total poin reputasi"
          icon="star"
        />
        <StatTile
          label="Akurasi"
          value={`${
            accuracyPercent(
              currentUser.stats.votesWon,
              currentUser.stats.votesLost,
            )
          }%`}
          hint={`${currentUser.stats.votesWon} benar · ${currentUser.stats.votesLost} salah`}
          icon="target"
          tone="success"
        />
        <StatTile
          label="Volume"
          value={formatNumber(myVolume)}
          hint="Total poin dipasang"
          icon="coins"
        />
      </div>

      <div className="card space-y-3 p-3.5">
        <div className="flex flex-wrap gap-2">
          {TABS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="chip"
              data-active={tab === option.key}
              onClick={() => setTab(option.key)}
            >
              <Icon name={option.icon} size={13} />
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {tab === "byReputation"
            ? "Reputasi bertambah dari prediksi yang benar, membuat prediksi, dan aktivitas sosial."
            : tab === "byAccuracy"
              ? "Akurasi dihitung dari prediksi yang sudah divalidasi admin (minimal 3 prediksi untuk masuk jajaran atas)."
              : "Volume adalah total poin yang pernah dipasang, baik menang maupun kalah."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {rows.slice(0, 3).map((row, index) => (
          <Link
            key={row.student.id}
            href="/profile"
            className="card flex items-center gap-3 p-4"
          >
            <div className="relative">
              <Avatar
                name={row.student.name}
                hue={row.student.avatarHue}
                size={48}
                verified={row.student.verified}
              />
              <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-[6px] border-2 border-[var(--ink)] bg-[var(--orange)] px-1 text-[11px] font-black text-[#171717]">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{row.student.name}</p>
              <p className="truncate text-[11px] text-[var(--muted)]">
                {row.student.program} · {row.student.campus}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[var(--ink)]">
                {metric(index)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <ul className="card divide-y-2 divide-[var(--ink)]">
        {rows.map((row, index) => {
          const isMe = row.student.id === currentUser.id;
          return (
            <li
              key={row.student.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isMe ? "border-l-4 border-[var(--orange)] bg-[var(--brand-soft)]" : "hover:bg-[var(--surface-2)]",
              )}
            >
              <span className="w-5 text-center text-xs font-bold text-[var(--muted)]">
                {index + 1}
              </span>
              <Avatar
                name={row.student.name}
                hue={row.student.avatarHue}
                size={36}
                verified={row.student.verified}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-xs font-bold">
                  {row.student.name}
                  {isMe ? <Badge tone="brand">Kamu</Badge> : null}
                </p>
                <p className="truncate text-[11px] text-[var(--muted)]">
                  {row.student.program} · {row.student.campus}
                </p>
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-[var(--muted)]">
                {metric(index)}
              </span>
            </li>
          );
        })}
      </ul>

      <div>
        <SectionHeader icon="pulse" title="Aktivitas terbaru" />
        <ul className="card divide-y-2 divide-[var(--ink)]">
          {feed.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="icon-tile h-8 w-8">
                <Icon name={ACTIVITY_ICON[item.icon] ?? "pulse"} size={15} />
              </span>
              <p className="min-w-0 flex-1 truncate text-xs">{item.text}</p>
              <span className="shrink-0 text-[11px] text-[var(--muted)]">
                {formatRelative(item.at)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
