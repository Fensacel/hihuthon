"use client";

import Link from "next/link";
import { MarketCard } from "@/components/MarketCard";
import { Avatar, Badge, EmptyState, SectionHeader, StatTile } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  activityFeed,
  currentUser,
  leaderboard,
  myRank,
  suggestedStudents,
  trendingMarkets,
} from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { accuracyPercent, cn, formatNumber } from "@/lib/utils";

export default function HomePage() {
  const { state } = useStore();
  const me = currentUser(state);
  const rank = myRank(state);
  const rankRow = leaderboard(state).byReputation.find(
    (row) => row.student.id === me.id,
  );
  const trending = trendingMarkets(state, 3);
  const suggestions = suggestedStudents(state, 3);
  const activity = activityFeed(state, 5);
  const accuracy = accuracyPercent(me.stats.votesWon, me.stats.votesLost);

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="relative">
          <div className="relative px-5 py-6 sm:px-7 sm:py-7">
            <span className="eyebrow">
              <span className="status-dot" />
              Beranda · Kampus {me.campus}
            </span>
            <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
              <div>
                <h1 className="display display-xl">
                  Halo, {me.name.split(" ")[0]}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                  {me.program} · Angkatan {me.batch}. Lanjut swipe profil,
                  ngobrol dengan match, lalu uji dugaanmu di pasar prediksi
                  kegiatan kampus.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href="/discover" className="btn btn-primary">
                    <Icon name="heart" size={16} />
                    Mulai Discover
                  </Link>
                  <Link href="/pulse" className="btn btn-ghost">
                    <Icon name="pulse" size={16} />
                    Ikut Prediksi
                  </Link>
                  <Link href="/matches" className="btn btn-ghost">
                    <Icon name="chat" size={16} />
                    Pesan
                  </Link>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="relative hidden min-h-[260px] lg:block"
              >
                <span className="absolute left-0 top-0 h-[104px] w-[104px] -rotate-6 rounded-[12px] border-2 border-[var(--ink)] bg-[var(--yellow)] shadow-[6px_6px_0_0_var(--shadow-color)]" />
                <span className="absolute right-2 top-6 h-16 w-16 rounded-full border-2 border-[var(--ink)] bg-[var(--orange)] shadow-[6px_6px_0_0_var(--shadow-color)]" />
                <span className="absolute left-10 top-32 h-[124px] w-[200px] rotate-3 rounded-[12px] border-2 border-[var(--ink)] bg-[var(--surface)] shadow-[6px_6px_0_0_var(--shadow-color)]">
                  <span className="checker absolute inset-x-0 top-3" />
                  <span className="gdots absolute bottom-3 left-3">
                    <span style={{ background: "var(--blue)" }} />
                    <span style={{ background: "var(--orange)" }} />
                    <span style={{ background: "var(--yellow)" }} />
                    <span style={{ background: "var(--green)" }} />
                  </span>
                </span>
                <span className="absolute bottom-2 right-8 h-[92px] w-4 rounded-[6px] border-2 border-[var(--ink)] bg-[var(--green)] shadow-[4px_4px_0_0_var(--shadow-color)]" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label="Poin"
                value={formatNumber(me.points)}
                hint="Saldo untuk prediksi"
                icon="coins"
              />
              <StatTile
                label="Reputasi"
                value={formatNumber(me.reputation)}
                hint="Total sepanjang waktu"
                icon="star"
                tone="warn"
              />
              <StatTile
                label="Prediksi Benar"
                value={`${me.stats.votesWon}/${me.stats.votesWon + me.stats.votesLost}`}
                hint={`Akurasi ${accuracy}%`}
                icon="target"
                tone="success"
              />
              <StatTile
                label="Volume"
                value={formatNumber(rankRow?.volume ?? 0)}
                hint="Poin diprediksikan"
                icon="trending"
              />
            </div>
          </div>

          <div className="checker" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-3 px-5 py-3">
            <Avatar name={me.name} hue={me.avatarHue} size={38} />
            <span className="min-w-0">
              <span className="eyebrow block">Peringkat kamu</span>
              <span className="font-display text-xl font-bold">#{rank}</span>
            </span>
            <span className="gdots ml-auto" aria-hidden="true">
              <span style={{ background: "var(--blue)" }} />
              <span style={{ background: "var(--red)" }} />
              <span style={{ background: "var(--yellow)" }} />
              <span style={{ background: "var(--green)" }} />
            </span>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          step="01"
          icon="trending"
          title="Prediksi Hangat"
          subtitle="Pool poin terbesar di kampus kamu"
          action={
            <Link
              href="/pulse"
              className="link text-xs"
            >
              Lihat semua
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((market) => (
            <MarketCard key={market.id} market={market} compact />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          step="02"
          icon="heart"
          title="Saran Kenalan"
          subtitle="Dipilih dari minat yang beririsan"
          action={
            <Link
              href="/discover"
              className="link text-xs"
            >
              Buka Discover
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {suggestions.map((student) => {
            const shared = student.interests.filter((interest) =>
              me.interests.includes(interest),
            );
            return (
              <Link
                key={student.id}
                href="/discover"
                className="card flex items-center gap-3 p-3.5"
              >
                <Avatar
                  name={student.name}
                  hue={student.avatarHue}
                  size={44}
                  verified={student.verified}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    {student.name.split(" ")[0]}, {student.age}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--muted)]">
                    {student.campus} · {student.program}
                  </span>
                  {shared.length > 0 ? (
                    <Badge tone="brand" className="mt-1">
                      {shared.length} minat sama
                    </Badge>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader step="03" icon="pulse" title="Aktivitas Terbaru" />
        {activity.length === 0 ? (
          <EmptyState
            icon="pulse"
            title="Belum ada aktivitas"
            description="Mulai swipe atau ikut satu prediksi untuk mengisi linimasa kamu."
            action={
              <Link href="/discover" className="btn btn-primary">
                Mulai sekarang
              </Link>
            }
          />
        ) : (
          <ul className="card divide-y divide-[var(--ink)]">
            {activity.map((item, index) => (
              <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={cn(
                    "icon-tile mt-0.5 h-8 w-8 shrink-0",
                    [
                      "bg-[var(--orange)]",
                      "bg-[var(--yellow)]",
                      "bg-[var(--green)]",
                      "bg-[var(--blue)] text-white",
                    ][index % 4],
                  )}
                >
                  <Icon
                    name={
                      item.icon === "match"
                        ? "heart"
                        : item.icon === "won"
                          ? "trophy"
                          : item.icon === "report"
                            ? "flag"
                            : item.icon === "market"
                              ? "plus"
                              : "target"
                    }
                    size={15}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{item.text}</span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.at))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
