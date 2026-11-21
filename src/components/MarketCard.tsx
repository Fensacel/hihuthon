"use client";

import Link from "next/link";
import { Badge, ProgressBar } from "./ui";
import { Icon, type IconName } from "./Icon";
import {
  MARKET_STATUS_LABEL,
  formatDeadline,
  formatNumber,
  marketStatus,
  computeTotals,
} from "@/lib/utils";
import type { Market, MarketStatus } from "@/lib/types";
import { useStore } from "@/lib/store";

const STATUS_TONE: Record<MarketStatus, "brand" | "success" | "warn" | "neutral"> =
  {
    open: "brand",
    "closing-soon": "warn",
    closed: "neutral",
    resolved: "success",
  };

const CATEGORY_ICON: Record<Market["category"], IconName> = {
  Sports: "bolt",
  "Campus Event": "calendar",
  Academic: "target",
  Community: "users",
  Fun: "sparkles",
};

export function StatusBadge({ market }: { market: Market }) {
  const status = marketStatus(market);
  return (
    <Badge tone={STATUS_TONE[status]} icon={status === "resolved" ? "check" : "clock"}>
      {MARKET_STATUS_LABEL[status]}
    </Badge>
  );
}

export function MarketCard({
  market,
  compact = false,
}: {
  market: Market;
  compact?: boolean;
}) {
  const { state } = useStore();
  const status = marketStatus(market);
  const totals = computeTotals(state.votes, market.id);
  const resolvedOption = market.options.find(
    (option) => option.id === market.resolvedOptionId,
  );
  const options = compact ? market.options.slice(0, 2) : market.options;

  return (
    <Link
      href={`/pulse/${market.id}`}
      className="card block p-4 transition hover:-translate-y-0.5 hover:border-brand-200"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral" icon={CATEGORY_ICON[market.category]}>
          {market.category}
        </Badge>
        <StatusBadge market={market} />
        <span className="ml-auto text-[11px] text-[var(--muted)]">
          {formatDeadline(market.closesAt)}
        </span>
      </div>

      <h3 className="mt-2.5 text-[15px] font-bold leading-snug">{market.question}</h3>

      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const percent = totals.optionPercents[option.id] ?? 0;
          const isWinner = market.resolvedOptionId === option.id;
          const isLeading =
            !market.resolvedOptionId && totals.leadingOptionId === option.id;
          return (
            <div key={option.id}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className={
                    isWinner
                      ? "font-bold text-emerald-700"
                      : isLeading
                        ? "font-semibold"
                        : "text-[var(--muted)]"
                  }
                >
                  {option.label}
                </span>
                <span className="font-semibold tabular-nums">{percent}%</span>
              </div>
              <ProgressBar
                className="mt-1 h-1.5"
                value={percent}
                tone={isWinner ? "success" : isLeading ? "brand" : "brand"}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1">
          <Icon name="coins" size={12} />
          {formatNumber(totals.pool)} poin
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="users" size={12} />
          {totals.voters} prediktor
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="pin" size={12} />
          {market.campus}
        </span>
        {status === "resolved" && resolvedOption ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
            <Icon name="check" size={12} />
            {resolvedOption.label}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
