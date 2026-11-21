"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarketCard } from "@/components/MarketCard";
import { Badge, EmptyState, SectionHeader, StatTile } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { sortedMarkets, totalsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { MARKET_STATUS_LABEL, formatNumber, marketStatus } from "@/lib/utils";
import type { Campus, MarketCategory, MarketStatus } from "@/lib/types";

const CATEGORY_FILTERS: Array<MarketCategory | "Semua"> = [
  "Semua",
  "Sports",
  "Campus Event",
  "Academic",
  "Community",
  "Fun",
];

const CAMPUS_FILTERS: Array<Campus | "Semua"> = ["Semua", "Kemang", "Sudirman"];

const STATUS_FILTERS: Array<MarketStatus | "Semua"> = [
  "Semua",
  "open",
  "closing-soon",
  "closed",
  "resolved",
];

export default function PulsePage() {
  const { state, currentUser } = useStore();
  const [category, setCategory] = useState<MarketCategory | "Semua">("Semua");
  const [campus, setCampus] = useState<Campus | "Semua">("Semua");
  const [status, setStatus] = useState<MarketStatus | "Semua">("Semua");

  const markets = useMemo(() => sortedMarkets(state), [state]);
  const filtered = markets.filter((market) => {
    if (category !== "Semua" && market.category !== category) return false;
    if (
      campus !== "Semua" &&
      market.campus !== campus &&
      market.campus !== "All"
    ) {
      return false;
    }
    if (status !== "Semua" && marketStatus(market) !== status) return false;
    return true;
  });

  const activeMarkets = markets.filter(
    (market) => marketStatus(market) !== "resolved",
  );
  const myVotes = state.votes.filter((vote) => vote.studentId === currentUser.id);
  const totalPool = activeMarkets.reduce(
    (sum, market) => sum + totalsFor(state, market.id).pool,
    0,
  );
  const openCount = markets.filter((market) =>
    ["open", "closing-soon"].includes(marketStatus(market)),
  ).length;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="pulse"
        title="Pulse"
        subtitle="Prediksi kegiatan kampus dengan poin virtual"
        action={
          <Link href="/pulse/create" className="btn btn-primary">
            <Icon name="plus" size={16} />
            Buat
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Prediksi Aktif"
          value={String(activeMarkets.length)}
          hint={`${openCount} masih terbuka`}
          icon="target"
        />
        <StatTile
          label="Total Pool"
          value={formatNumber(totalPool)}
          hint="Poin terpasang"
          icon="coins"
          tone="warn"
        />
        <StatTile
          label="Prediksimu"
          value={String(myVotes.length)}
          hint="Termasuk yang selesai"
          icon="check"
          tone="success"
        />
        <StatTile
          label="Kategori"
          value={String(CATEGORY_FILTERS.length - 1)}
          hint="Sports · Event · Academic…"
          icon="sparkles"
        />
      </div>

      <div className="card space-y-3 p-3.5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {CATEGORY_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className="chip shrink-0"
              data-active={category === option}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {CAMPUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className="chip"
              data-active={campus === option}
              onClick={() => setCampus(option)}
            >
              <Icon name="pin" size={12} />
              {option === "Semua" ? "Semua kampus" : option}
            </button>
          ))}
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className="chip"
              data-active={status === option}
              onClick={() => setStatus(option)}
            >
              {option === "Semua" ? "Semua status" : MARKET_STATUS_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">
          Menampilkan <strong>{filtered.length}</strong> dari {markets.length}{" "}
          prediksi
        </p>
        {category !== "Semua" || campus !== "Semua" || status !== "Semua" ? (
          <button
            type="button"
            className="link text-xs"
            onClick={() => {
              setCategory("Semua");
              setCampus("Semua");
              setStatus("Semua");
            }}
          >
            Reset filter
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Tidak ada prediksi yang cocok"
          description="Coba ganti filter kategori, kampus, atau status."
          action={
            <Link href="/pulse/create" className="btn btn-primary">
              <Icon name="plus" size={16} />
              Buat prediksi baru
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="icon-tile h-9 w-9">
            <Icon name="info" size={17} />
          </span>
          <div>
            <p className="text-sm font-bold">Poin virtual, bukan uang</p>
            <p className="text-xs text-[var(--muted)]">
              Semua taruhan memakai poin hasil aktivitas sosial di SocialHub.
              Payout mengikuti sistem pari-mutuel: pemenang berbagi seluruh pool.
            </p>
          </div>
        </div>
        <Badge tone="brand" icon="shield">
          Hasil divalidasi admin
        </Badge>
      </div>
    </div>
  );
}
