"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Badge, ProgressBar, SectionHeader } from "./ui";
import { Icon } from "./Icon";
import { StatusBadge } from "./MarketCard";
import { ReportDialog } from "./ReportDialog";
import { findStudent, myVote, totalsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import {
  formatClock,
  formatDate,
  formatDeadline,
  formatNumber,
  marketStatus,
  potentialPayout,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const STAKE_PRESETS = [5, 10, 25, 50, 100];

export function MarketDetail({ marketId }: { marketId: string }) {
  const { state, currentUser, placeVote, notify } = useStore();
  const market = state.markets.find((item) => item.id === marketId) ?? null;
  const [optionId, setOptionId] = useState<string | null>(null);
  const [stake, setStake] = useState(10);
  const [reportOpen, setReportOpen] = useState(false);

  const vote = useMemo(
    () => (market ? myVote(state, market.id) : undefined),
    [state, market],
  );
  const totals = useMemo(
    () => (market ? totalsFor(state, market.id) : null),
    [state, market],
  );

  if (!market || !totals) {
    return (
      <div className="card p-6 text-center">
        <p className="font-bold">Prediksi tidak ditemukan</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Mungkin data demo sudah direset.
        </p>
        <Link href="/pulse" className="btn btn-primary mt-4">
          Kembali ke Pulse
        </Link>
      </div>
    );
  }

  const status = marketStatus(market);
  const creator = findStudent(state, market.createdBy);
  const locked = status === "closed" || status === "resolved";
  const selected = optionId ?? vote?.optionId ?? market.options[0]?.id ?? null;
  const optionStake = selected ? (totals.optionStakes[selected] ?? 0) : 0;
  const estimate = potentialPayout(stake, optionStake, totals.pool);
  const resolvedOption = market.options.find(
    (option) => option.id === market.resolvedOptionId,
  );
  const recentVotes = state.votes
    .filter((item) => item.marketId === market.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const submit = () => {
    if (!selected) return;
    const ok = placeVote(market.id, selected, stake);
    if (ok) setOptionId(null);
  };

  return (
    <div className="space-y-4">
      <Link
        href="/pulse"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--orange)]"
      >
        <Icon name="back" size={15} />
        Semua prediksi
      </Link>

      <section className="card overflow-hidden">
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" icon="sparkles">
              {market.category}
            </Badge>
            <StatusBadge market={market} />
            <Badge tone="neutral" icon="pin">
              {market.campus === "All" ? "Semua kampus" : market.campus}
            </Badge>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--danger-ink)]"
            >
              <Icon name="flag" size={13} />
              Laporkan
            </button>
          </div>

          <h1 className="display text-2xl leading-tight">{market.question}</h1>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {market.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={13} />
              {locked
                ? `Ditutup ${formatDate(market.closesAt)}`
                : `Tutup ${formatDeadline(market.closesAt)}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="coins" size={13} />
              Pool {formatNumber(totals.pool)} poin
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={13} />
              {totals.voters} prediktor
            </span>
          </div>

          {creator ? (
            <div className="flex items-center gap-2.5 rounded-[12px] border-2 border-[var(--ink)] bg-[var(--surface-2)] p-3">
              <Avatar
                name={creator.name}
                hue={creator.avatarHue}
                size={36}
                verified={creator.verified}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold">
                  Dibuat oleh {creator.name}
                  {creator.role === "admin" ? " · Admin kampus" : ""}
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  {creator.program} · {formatDate(market.createdAt)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 border-t-2 border-[var(--ink)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Distribusi prediksi
          </p>
          {market.options.map((option) => {
            const percent = totals.optionPercents[option.id] ?? 0;
            const isWinner = market.resolvedOptionId === option.id;
            const isMine = vote?.optionId === option.id;
            return (
              <div key={option.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-semibold",
                        isWinner ? "text-[var(--success-ink)]" : "",
                      )}
                    >
                      {option.label}
                    </span>
                    {isMine ? <Badge tone="brand">Prediksimu</Badge> : null}
                    {isWinner ? <Badge tone="success" icon="check">Hasil</Badge> : null}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
                    {formatNumber(totals.optionStakes[option.id] ?? 0)} · {percent}%
                  </span>
                </div>
                <ProgressBar
                  className="mt-1.5"
                  value={percent}
                  tone={isWinner ? "success" : "brand"}
                />
              </div>
            );
          })}
        </div>
      </section>

      {status === "resolved" ? (
        <section className="card p-5">
          <div className="flex items-start gap-3">
            <span className="icon-tile h-10 w-10 bg-[var(--green)]">
              <Icon name="trophy" size={19} />
            </span>
            <div>
              <p className="text-sm font-bold">
                Hasil: {resolvedOption?.label ?? "—"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Divalidasi admin pada{" "}
                {market.resolvedAt ? formatDate(market.resolvedAt) : "—"}.
              </p>
              {vote ? (
                <p className="mt-2 text-sm">
                  {vote.outcome === "won" ? (
                    <span className="font-bold text-[var(--success-ink)]">
                      Prediksimu benar — payout +{formatNumber(vote.payout ?? 0)} poin
                    </span>
                  ) : (
                    <span className="font-bold text-[var(--danger-ink)]">
                      Prediksimu belum tepat — stake {formatNumber(vote.stake)} poin
                      hangus
                    </span>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Kamu tidak ikut memprediksi market ini.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : locked ? (
        <section className="card flex items-start gap-3 p-5">
          <span className="icon-tile h-10 w-10 bg-[var(--yellow)]">
            <Icon name="clock" size={19} />
          </span>
          <div>
            <p className="text-sm font-bold">Menunggu validasi admin</p>
            <p className="text-xs text-[var(--muted)]">
              Prediksi sudah ditutup. Admin kampus akan memvalidasi hasilnya, lalu
              poin dibagikan otomatis ke pemenang.
            </p>
          </div>
        </section>
      ) : (
        <section className="card space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">
              {vote ? "Ubah prediksimu" : "Pasang prediksimu"}
            </p>
            <Badge tone="neutral" icon="coins">
              Saldo {formatNumber(currentUser.points)} poin
            </Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {market.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setOptionId(option.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-[12px] border-2 px-3.5 py-3 text-left text-sm font-bold transition",
                  selected === option.id
                    ? "border-[var(--ink)] bg-[var(--brand-soft)] text-[var(--ink)] shadow-[3px_3px_0_0_var(--shadow-color)]"
                    : "border-[var(--ink)] bg-[var(--surface-2)] hover:-translate-y-0.5",
                )}
              >
                {option.label}
                <span className="text-[11px] font-medium text-[var(--muted)]">
                  {totals.optionPercents[option.id] ?? 0}%
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="label">Jumlah poin</p>
            <div className="flex flex-wrap items-center gap-2">
              {STAKE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="chip"
                  data-active={stake === preset}
                  onClick={() => setStake(preset)}
                >
                  {preset} poin
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={Math.max(1, currentUser.points)}
                value={stake}
                onChange={(event) =>
                  setStake(Math.max(1, Number(event.target.value) || 1))
                }
                className="input h-9 w-24 py-0"
                aria-label="Poin taruhan"
              />
            </div>
          </div>

          <div className="rounded-[12px] border-2 border-[var(--ink)] bg-[var(--surface-2)] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">
                Estimasi payout bila benar
              </span>
              <span className="font-bold">+{formatNumber(estimate)} poin</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[var(--muted)]">Pool saat ini</span>
              <span className="font-semibold">
                {formatNumber(totals.pool)} poin
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
              Sistem pari-mutuel: seluruh pool dibagi proporsional ke prediktor yang
              benar. Estimasi bisa berubah sampai market ditutup.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={
              !selected ||
              stake < 1 ||
              stake > currentUser.points + (vote?.stake ?? 0)
            }
            onClick={submit}
          >
            <Icon name="target" size={16} />
            {vote ? "Perbarui prediksi" : "Konfirmasi prediksi"}
          </button>
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() =>
              notify(
                "Poin bertambah dari swipe, match, chat, dan membuat prediksi baru.",
                "info",
              )
            }
          >
            <Icon name="info" size={16} />
            Cara menambah poin
          </button>
        </section>
      )}

      <section>
        <SectionHeader
          icon="users"
          title="Prediktor terbaru"
          subtitle={`${totals.voters} mahasiswa sudah ikut`}
        />
        {recentVotes.length === 0 ? (
          <p className="card p-4 text-sm text-[var(--muted)]">
            Belum ada yang memprediksi. Jadilah yang pertama!
          </p>
        ) : (
          <ul className="card divide-y-2 divide-[var(--ink)]">
            {recentVotes.map((item) => {
              const student = findStudent(state, item.studentId);
              const option = market.options.find(
                (entry) => entry.id === item.optionId,
              );
              if (!student) return null;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <Avatar
                    name={student.name}
                    hue={student.avatarHue}
                    size={34}
                    verified={student.verified}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{student.name}</p>
                    <p className="truncate text-[11px] text-[var(--muted)]">
                      {option?.label ?? "—"} · {formatClock(item.createdAt)}
                    </p>
                  </div>
                  {item.outcome === "won" ? (
                    <Badge tone="success" icon="trophy">
                      +{formatNumber(item.payout ?? 0)}
                    </Badge>
                  ) : item.outcome === "lost" ? (
                    <Badge tone="danger" icon="close">
                      {formatNumber(item.stake)}
                    </Badge>
                  ) : (
                    <Badge tone="neutral" icon="coins">
                      {formatNumber(item.stake)} poin
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetMarketId={market.id}
        targetLabel={market.question}
      />

    </div>
  );
}
