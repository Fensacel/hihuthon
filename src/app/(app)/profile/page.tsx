"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Badge, Field, Modal, SectionHeader, StatTile } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ReportDialog } from "@/components/ReportDialog";
import { activityFeed, myRank } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import {
  accuracyPercent,
  cn,
  formatDate,
  formatNumber,
  formatRelative,
} from "@/lib/utils";
import type { StudentGoal } from "@/lib/types";

const GOAL_OPTIONS: StudentGoal[] = [
  "Friends",
  "Study Buddy",
  "Networking",
  "Dating",
];

export default function ProfilePage() {
  const router = useRouter();
  const { state, currentUser, updateProfile, logout, resetDemo } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [program, setProgram] = useState(currentUser.program);
  const [interests, setInterests] = useState(currentUser.interests.join(", "));
  const [goals, setGoals] = useState<StudentGoal[]>(currentUser.goals);

  const rank = myRank(state);
  const feed = useMemo(() => activityFeed(state, 8), [state]);
  const myVotes = useMemo(
    () =>
      state.votes
        .filter((vote) => vote.studentId === currentUser.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state, currentUser.id],
  );
  const volume = myVotes.reduce((sum, vote) => sum + vote.stake, 0);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="user"
        title="Profil"
        subtitle="Kelola identitas kampus, minat, dan tujuan sosialmu"
        action={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setName(currentUser.name);
              setBio(currentUser.bio);
              setProgram(currentUser.program);
              setInterests(currentUser.interests.join(", "));
              setGoals(currentUser.goals);
              setEditOpen(true);
            }}
          >
            <Icon name="edit" size={16} />
            Edit
          </button>
        }
      />

      <section className="card overflow-hidden">
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar
            name={currentUser.name}
            hue={currentUser.avatarHue}
            size={72}
            verified={currentUser.verified}
          />
          <div className="min-w-0 flex-1">
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-black">
              {currentUser.name}
              {currentUser.verified ? (
                <Badge tone="brand" icon="verified">
                  Terverifikasi
                </Badge>
              ) : null}
              {currentUser.role === "admin" ? (
                <Badge tone="warn" icon="shield">
                  Admin
                </Badge>
              ) : null}
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {currentUser.program} · Angkatan {currentUser.batch} ·{" "}
              {currentUser.campus}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{currentUser.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {currentUser.interests.map((interest) => (
                <span key={interest} className="chip chip-static">
                  {interest}
                </span>
              ))}
              {currentUser.goals.map((goal) => (
                <Badge key={goal} tone="brand" icon="target">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Peringkat"
          value={`#${rank}`}
          hint={`${state.students.length} mahasiswa`}
          icon="trophy"
          tone="warn"
        />
        <StatTile
          label="Reputasi"
          value={formatNumber(currentUser.reputation)}
          hint="Kumulatif"
          icon="star"
        />
        <StatTile
          label="Akurasi"
          value={`${accuracyPercent(
            currentUser.stats.votesWon,
            currentUser.stats.votesLost,
          )}%`}
          hint={`${currentUser.stats.votesWon} benar · ${currentUser.stats.votesLost} salah`}
          icon="target"
          tone="success"
        />
        <StatTile
          label="Saldo Poin"
          value={formatNumber(currentUser.points)}
          hint={`Volume ${formatNumber(volume)} poin`}
          icon="coins"
        />
      </div>

      <section>
        <SectionHeader
          icon="target"
          title="Prediksimu"
          subtitle={`${myVotes.length} prediksi · ${currentUser.stats.marketsCreated} prediksi dibuat`}
          action={
            <Link href="/pulse" className="btn btn-ghost">
              <Icon name="pulse" size={16} />
              Cari prediksi
            </Link>
          }
        />
        {myVotes.length === 0 ? (
          <p className="card p-4 text-sm text-[var(--muted)]">
            Belum ada prediksi. Ikut satu prediksi untuk mulai mengumpulkan reputasi.
          </p>
        ) : (
          <ul className="card divide-y divide-[var(--line)]">
            {myVotes.map((vote) => {
              const market = state.markets.find(
                (item) => item.id === vote.marketId,
              );
              const option = market?.options.find(
                (item) => item.id === vote.optionId,
              );
              if (!market) return null;
              return (
                <li key={vote.id}>
                  <Link
                    href={`/pulse/${market.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--background)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">
                        {market.question}
                      </p>
                      <p className="truncate text-[11px] text-[var(--muted)]">
                        {option?.label ?? "—"} · {formatRelative(vote.createdAt)}
                      </p>
                    </div>
                    {vote.outcome === "won" ? (
                      <Badge tone="success" icon="trophy">
                        +{formatNumber(vote.payout ?? 0)}
                      </Badge>
                    ) : vote.outcome === "lost" ? (
                      <Badge tone="danger" icon="close">
                        {formatNumber(vote.stake)}
                      </Badge>
                    ) : (
                      <Badge tone="neutral" icon="coins">
                        {formatNumber(vote.stake)} poin
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader icon="pulse" title="Aktivitasmu" />
        {feed.length === 0 ? (
          <p className="card p-4 text-sm text-[var(--muted)]">
            Belum ada aktivitas. Mulai swipe di Discover.
          </p>
        ) : (
          <ul className="card divide-y divide-[var(--line)]">
            {feed.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name="pulse" size={15} />
                </span>
                <p className="min-w-0 flex-1 truncate text-xs">{item.text}</p>
                <span className="shrink-0 text-[11px] text-[var(--muted)]">
                  {formatRelative(item.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Pengaturan demo</p>
            <p className="text-xs text-[var(--muted)]">
              Data contoh terakhir dibuat {formatDate(state.seededAt)}. Semua data
              tersimpan lokal di browser ini.
            </p>
          </div>
          <Badge tone="neutral" icon="info">
            Poin virtual
          </Badge>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => setReportOpen(true)}
          >
            <Icon name="flag" size={16} />
            Laporkan masalah akun
          </button>
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => {
              if (
                !window.confirm(
                  "Reset demo akan menghapus semua match, chat, prediksi, dan poin lokal di browser ini dan membangun ulang data contoh. Lanjutkan?",
                )
              ) {
                return;
              }
              resetDemo();
              router.replace("/");
            }}
          >
            <Icon name="alert" size={16} />
            Reset data demo
          </button>
          <button
            type="button"
            className="btn btn-ghost flex-1 text-rose-600"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            <Icon name="logout" size={16} />
            Keluar
          </button>
        </div>
      </section>

      <Modal
        open={editOpen}
        title="Edit profil"
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => setEditOpen(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              disabled={name.trim().length < 3 || bio.trim().length < 8}
              onClick={() => {
                updateProfile({
                  name: name.trim(),
                  bio: bio.trim(),
                  program: program.trim(),
                  interests: interests
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .slice(0, 8),
                  goals,
                });
                setEditOpen(false);
              }}
            >
              Simpan
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Nama" hint="Minimal 3 karakter.">
            <input
              className="input"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Bio" hint="Minimal 8 karakter.">
            <textarea
              className="textarea"
              rows={3}
              value={bio}
              maxLength={240}
              onChange={(event) => setBio(event.target.value)}
            />
          </Field>
          <Field label="Program studi">
            <input
              className="input"
              value={program}
              maxLength={60}
              onChange={(event) => setProgram(event.target.value)}
            />
          </Field>
          <Field label="Minat" hint="Pisahkan dengan koma, maksimal 8 minat.">
            <input
              className="input"
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
            />
          </Field>
          <div>
            <p className="label">Tujuan sosial</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={cn("chip", goals.includes(goal) ? "" : "opacity-60")}
                  data-active={goals.includes(goal)}
                  onClick={() =>
                    setGoals((prev) =>
                      prev.includes(goal)
                        ? prev.filter((item) => item !== goal)
                        : [...prev, goal],
                    )
                  }
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetStudentId={currentUser.id}
        targetLabel={currentUser.name}
      />

    </div>
  );
}
