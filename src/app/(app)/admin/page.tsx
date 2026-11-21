"use client";

import { useMemo, useState } from "react";
import { Avatar, Badge, EmptyState, SectionHeader, StatTile } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { findStudent, marketsAwaitingValidation, totalsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import {
  MARKET_STATUS_LABEL,
  cn,
  formatDate,
  formatNumber,
  formatRelative,
} from "@/lib/utils";
import type { Report, ReportStatus } from "@/lib/types";

type TabKey = "reports" | "validation" | "students";

const TABS: Array<{ key: TabKey; label: string; icon: IconName }> = [
  { key: "reports", label: "Laporan", icon: "flag" },
  { key: "validation", label: "Validasi Hasil", icon: "check" },
  { key: "students", label: "Mahasiswa", icon: "users" },
];

const REPORT_STATUS_TONE: Record<
  ReportStatus,
  "warn" | "brand" | "success" | "neutral"
> = {
  open: "warn",
  reviewing: "brand",
  resolved: "success",
  dismissed: "neutral",
};

const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  open: "Baru",
  reviewing: "Ditinjau",
  resolved: "Selesai",
  dismissed: "Ditolak",
};

export default function AdminPage() {
  const { state, currentUser, reviewReport, resolveMarket, setVerified } =
    useStore();
  const [tab, setTab] = useState<TabKey>("reports");
  const [reportFilter, setReportFilter] = useState<ReportStatus | "semua">("open");
  const [search, setSearch] = useState("");
  const [pickedOption, setPickedOption] = useState<Record<string, string>>({});

  const awaiting = useMemo(() => marketsAwaitingValidation(state), [state]);
  const reports = useMemo(() => {
    const list =
      reportFilter === "semua"
        ? state.reports
        : state.reports.filter((report) => report.status === reportFilter);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.reports, reportFilter]);
  const openReports = state.reports.filter(
    (report) => report.status === "open",
  ).length;
  const students = state.students.filter((student) =>
    `${student.name} ${student.program} ${student.campus}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  if (currentUser.role !== "admin") {
    return (
      <EmptyState
        icon="shield"
        title="Halaman khusus admin"
        description="Masuk memakai akun admin kampus untuk meninjau laporan, memvalidasi hasil prediksi, dan memverifikasi akun mahasiswa."
      />
    );
  }

  const reportTarget = (report: Report) => {
    if (report.targetStudentId) {
      return findStudent(state, report.targetStudentId)?.name ?? "Mahasiswa";
    }
    if (report.targetMarketId) {
      return (
        state.markets.find((market) => market.id === report.targetMarketId)
          ?.question ?? "Prediksi"
      );
    }
    return "Tidak ada target";
  };

  const validate = (marketId: string) => {
    const optionId = pickedOption[marketId];
    if (!optionId) return;
    const market = state.markets.find((item) => item.id === marketId);
    const option = market?.options.find((item) => item.id === optionId);
    if (
      !window.confirm(
        `Validasi hasil "${market?.question ?? "prediksi ini"}" sebagai "${option?.label ?? ""}"? Poin langsung dibagikan ke pemenang dan tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return;
    }
    resolveMarket(marketId, optionId);
    setPickedOption((prev) => {
      const next = { ...prev };
      delete next[marketId];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="shield"
        title="Admin kampus"
        subtitle="Tinjau laporan, validasi hasil prediksi, dan verifikasi akun"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Laporan Baru"
          value={String(openReports)}
          hint="Butuh tinjauan"
          icon="flag"
          tone="warn"
        />
        <StatTile
          label="Menunggu Validasi"
          value={String(awaiting.length)}
          hint="Prediksi sudah tutup"
          icon="check"
          tone="success"
        />
        <StatTile
          label="Mahasiswa"
          value={String(state.students.length)}
          hint={`${state.students.filter((student) => student.verified).length} terverifikasi`}
          icon="users"
        />
        <StatTile
          label="Prediksi"
          value={String(state.markets.length)}
          hint={`${state.markets.filter((market) => market.resolvedOptionId).length} selesai`}
          icon="pulse"
        />
      </div>

      <div className="card flex flex-wrap gap-2 p-3.5">
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
            {option.key === "reports" && openReports > 0 ? (
              <span className="rounded-full bg-white/25 px-1.5 text-[10px] font-bold">
                {openReports}
              </span>
            ) : null}
            {option.key === "validation" && awaiting.length > 0 ? (
              <span className="rounded-full bg-white/25 px-1.5 text-[10px] font-bold">
                {awaiting.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "reports" ? (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["open", "reviewing", "resolved", "dismissed", "semua"] as const).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  className="chip"
                  data-active={reportFilter === option}
                  onClick={() => setReportFilter(option)}
                >
                  {option === "semua" ? "Semua" : REPORT_STATUS_LABEL[option]}
                </button>
              ),
            )}
          </div>

          {reports.length === 0 ? (
            <EmptyState
              icon="check"
              title="Tidak ada laporan di filter ini"
              description="Laporan baru dari mahasiswa akan muncul di sini untuk ditinjau."
            />
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => {
                const reporter = findStudent(state, report.reporterId);
                return (
                  <li key={report.id} className="card space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={REPORT_STATUS_TONE[report.status]}
                        icon={report.status === "open" ? "alert" : "flag"}
                      >
                        {REPORT_STATUS_LABEL[report.status]}
                      </Badge>
                      <Badge tone="neutral" icon="clock">
                        {formatRelative(report.createdAt)}
                      </Badge>
                      <span className="ml-auto text-[11px] text-[var(--muted)]">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold">{report.reason}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {report.details}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="user" size={13} />
                        Pelapor: {reporter?.name ?? "Mahasiswa"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="target" size={13} />
                        Target: {reportTarget(report)}
                      </span>
                    </div>

                    {report.reviewNote ? (
                      <p className="rounded-2xl bg-[var(--background)] p-3 text-[11px] text-[var(--muted)]">
                        Catatan admin: {report.reviewNote}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={report.status === "reviewing"}
                        onClick={() =>
                          reviewReport(
                            report.id,
                            "reviewing",
                            "Sedang ditinjau admin kampus.",
                          )
                        }
                      >
                        <Icon name="search" size={15} />
                        Tandai ditinjau
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={report.status === "resolved"}
                        onClick={() =>
                          reviewReport(
                            report.id,
                            "resolved",
                            "Laporan valid, tindakan sudah diambil.",
                          )
                        }
                      >
                        <Icon name="check" size={15} />
                        Selesai
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost text-rose-600"
                        disabled={report.status === "dismissed"}
                        onClick={() =>
                          reviewReport(
                            report.id,
                            "dismissed",
                            "Laporan tidak cukup bukti.",
                          )
                        }
                      >
                        <Icon name="close" size={15} />
                        Tolak
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "validation" ? (
        <section className="space-y-3">
          {awaiting.length === 0 ? (
            <EmptyState
              icon="check"
              title="Semua hasil sudah divalidasi"
              description="Prediksi yang sudah ditutup dan belum ada hasilnya akan muncul di sini."
            />
          ) : (
            awaiting.map((market) => {
              const totals = totalsFor(state, market.id);
              const creator = findStudent(state, market.createdBy);
              const picked = pickedOption[market.id] ?? null;
              return (
                <article key={market.id} className="card space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral" icon="calendar">
                      {market.category}
                    </Badge>
                    <Badge tone="neutral" icon="clock">
                      {MARKET_STATUS_LABEL.closed}
                    </Badge>
                    <Badge tone="neutral" icon="pin">
                      {market.campus === "All" ? "Semua kampus" : market.campus}
                    </Badge>
                    <span className="ml-auto text-[11px] text-[var(--muted)]">
                      Ditutup {formatDate(market.closesAt)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold">{market.question}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {market.description}
                    </p>
                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      Pool {formatNumber(totals.pool)} poin · {totals.voters}{" "}
                      prediktor · dibuat {creator?.name ?? "mahasiswa"}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {market.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setPickedOption((prev) => ({
                            ...prev,
                            [market.id]: option.id,
                          }))
                        }
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition",
                          picked === option.id
                            ? "border-brand-400 bg-brand-50 text-brand-700"
                            : "border-[var(--line)] hover:border-brand-200",
                        )}
                      >
                        {option.label}
                        <span className="text-[11px] font-medium text-[var(--muted)]">
                          {totals.optionPercents[option.id] ?? 0}%
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    disabled={!picked}
                    onClick={() => validate(market.id)}
                  >
                    <Icon name="check" size={16} />
                    Validasi hasil &amp; bagikan poin
                  </button>
                </article>
              );
            })
          )}
        </section>
      ) : null}

      {tab === "students" ? (
        <section className="space-y-3">
          <div className="card p-3.5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <Icon name="search" size={15} />
              </span>
              <input
                className="input pl-9"
                value={search}
                placeholder="Cari nama, program, atau kampus..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {students.length === 0 ? (
            <EmptyState
              icon="search"
              title="Mahasiswa tidak ditemukan"
              description="Coba kata kunci lain untuk mencari mahasiswa."
            />
          ) : (
            <ul className="card divide-y divide-[var(--line)]">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    name={student.name}
                    hue={student.avatarHue}
                    size={38}
                    verified={student.verified}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 truncate text-xs font-bold">
                      {student.name}
                      {student.role === "admin" ? (
                        <Badge tone="warn" icon="shield">
                          Admin
                        </Badge>
                      ) : null}
                      {student.verified ? (
                        <Badge tone="success" icon="verified">
                          Terverifikasi
                        </Badge>
                      ) : null}
                    </p>
                    <p className="truncate text-[11px] text-[var(--muted)]">
                      {student.program} · {student.campus} ·{" "}
                      {formatNumber(student.points)} poin
                    </p>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "btn",
                      student.verified ? "btn-ghost" : "btn-primary",
                    )}
                    onClick={() => setVerified(student.id, !student.verified)}
                  >
                    <Icon
                      name={student.verified ? "close" : "verified"}
                      size={15}
                    />
                    {student.verified ? "Cabut verifikasi" : "Verifikasi"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

    </div>
  );
}
