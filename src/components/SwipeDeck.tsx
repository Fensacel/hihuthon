"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, Badge } from "./ui";
import { Icon } from "./Icon";
import { ReportDialog } from "./ReportDialog";
import { discoverQueue } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Student } from "@/lib/types";

const DIRECTION_LABEL: Record<"like" | "pass", string> = {
  like: "Suka",
  pass: "Lewati",
};

export function SwipeDeck({
  onMatch,
}: {
  onMatch: (matchId: string, partnerName: string) => void;
}) {
  const { state, swipe, notify } = useStore();
  const queue = useMemo(() => discoverQueue(state), [state]);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reportFor, setReportFor] = useState<Student | null>(null);
  const startX = useRef(0);

  const top = queue[0];
  const behind = queue.slice(1, 3);

  const act = (direction: "like" | "pass") => {
    if (!top) return;
    const partner = top;
    const matchId = swipe(partner.id, direction);
    setDrag(0);
    setDragging(false);
    if (direction === "like" && matchId) {
      onMatch(matchId, partner.name);
    } else if (direction === "like") {
      notify(`Kamu menyukai ${partner.name.split(" ")[0]}. Menunggu balasan…`, "info");
    }
    if (direction === "pass") {
      notify(`${partner.name.split(" ")[0]} dilewati.`, "info");
    }
  };

  if (!top) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <span className="icon-tile h-12 w-12">
          <Icon name="search" size={22} />
        </span>
        <div>
          <p className="font-bold">Kamu sudah melihat semua mahasiswa terdekat</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cek halaman Pulse untuk memprediksi kegiatan kampus sambil menunggu
            profil baru.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pulse" className="btn btn-primary">
            <Icon name="pulse" size={16} />
            Buka Pulse
          </Link>
          <Link href="/matches" className="btn btn-ghost">
            <Icon name="chat" size={16} />
            Chat kamu
          </Link>
        </div>
      </div>
    );
  }

  const rotate = Math.max(-12, Math.min(12, drag / 12));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[440px] select-none sm:h-[460px]">
        {behind
          .slice()
          .reverse()
          .map((student, index) => (
            <div
              key={student.id}
              className="card-flat absolute inset-x-0 top-0 h-full"
              style={{
                transform: `translateY(${(index + 1) * 9}px) scale(${1 - (index + 1) * 0.035})`,
                opacity: 0.5,
                zIndex: index,
              }}
              aria-hidden="true"
            />
          ))}

        <article
          className="card absolute inset-x-0 top-0 z-10 flex h-full cursor-grab flex-col overflow-hidden"
          style={{
            transform: `translateX(${drag}px) rotate(${rotate}deg)`,
            transition: dragging ? "none" : "transform 0.22s ease",
          }}
          onPointerDown={(event) => {
            startX.current = event.clientX;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!dragging) return;
            setDrag(event.clientX - startX.current);
          }}
          onPointerUp={() => {
            setDragging(false);
            if (drag > 90) act("like");
            else if (drag < -90) act("pass");
            else setDrag(0);
          }}
          onPointerCancel={() => {
            setDragging(false);
            setDrag(0);
          }}
        >
          <div className="relative h-40 shrink-0 overflow-hidden border-b-2 border-[var(--ink)] bg-[var(--blue)]">
            <span
              aria-hidden="true"
              className="absolute -right-6 -top-10 h-36 w-36 rotate-12 rounded-[12px] border-2 border-[var(--ink)] bg-[var(--yellow)]"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/3 top-3 h-16 w-16 rounded-full border-2 border-[var(--ink)] bg-[var(--orange)]"
            />
            <span
              aria-hidden="true"
              className="absolute left-6 top-5 h-20 w-3 rounded-[6px] border-2 border-[var(--ink)] bg-[var(--green)]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-[#171717]/75 to-transparent p-4">
              <Avatar name={top.name} hue={top.avatarHue} size={64} />
              <div className="pb-1 text-white">
                <p className="text-lg font-black leading-tight">
                  {top.name}
                  {top.verified ? " ✓" : ""}
                </p>
                <p className="text-xs opacity-90">
                  {top.age} tahun · {top.program}
                </p>
              </div>
            </div>
            {drag !== 0 ? (
              <span
                className={
                  drag > 0
                    ? "absolute right-4 top-4 rounded-[8px] border-2 border-[var(--ink)] bg-[var(--green)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717] shadow-[3px_3px_0_0_var(--shadow-color)]"
                    : "absolute left-4 top-4 rounded-[8px] border-2 border-[var(--ink)] bg-[var(--red)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#171717] shadow-[3px_3px_0_0_var(--shadow-color)]"
                }
              >
                {DIRECTION_LABEL[drag > 0 ? "like" : "pass"]}
              </span>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-sm leading-relaxed text-[var(--foreground)]">{top.bio}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="brand" icon="pin">
                Kampus {top.campus}
              </Badge>
              <Badge tone="neutral" icon="calendar">
                Angkatan {top.batch}
              </Badge>
              {top.goals.map((goal) => (
                <Badge key={goal} tone="success" icon="target">
                  {goal}
                </Badge>
              ))}
            </div>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Minat
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {top.interests.map((interest) => (
                <span key={interest} className="chip chip-static">
                  {interest}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setReportFor(top)}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)] underline-offset-2 hover:text-[var(--danger-ink)] hover:underline"
            >
              <Icon name="flag" size={13} />
              Laporkan profil ini
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 border-t-2 border-[var(--ink)] px-5 py-4">
            <button
              type="button"
              onClick={() => act("pass")}
              className="btn btn-danger h-14 w-14 rounded-[12px] p-0"
              aria-label="Lewati profil"
            >
              <Icon name="close" size={24} />
            </button>
            <div className="text-center text-[11px] text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">
                {queue.length} profil tersisa
              </p>
              <p>Geser atau tekan tombol</p>
            </div>
            <button
              type="button"
              onClick={() => act("like")}
              className="btn btn-primary h-14 w-14 rounded-[12px] p-0"
              aria-label="Suka profil"
            >
              <Icon name="heart" size={24} />
            </button>
          </div>
        </article>
      </div>

      <ReportDialog
        open={reportFor !== null}
        onClose={() => setReportFor(null)}
        targetStudentId={reportFor?.id ?? null}
        targetLabel={reportFor ? `${reportFor.name} · ${reportFor.program}` : undefined}
      />
    </div>
  );
}
