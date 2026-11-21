"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Badge } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/lib/store";
import { cn, formatNumber } from "@/lib/utils";

const HIGHLIGHTS: Array<{ icon: IconName; text: string }> = [
  { icon: "heart", text: "Swipe profil mahasiswa satu kampus" },
  { icon: "chat", text: "Chat & match dengan minat yang sama" },
  { icon: "pulse", text: "Prediksi acara, lomba, dan hasil kampus" },
  { icon: "trophy", text: "Kumpulkan poin dan naik peringkat" },
];

export default function LoginPage() {
  const { state, login, currentUser, resetDemo } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(currentUser.id);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return state.students;
    return state.students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.program.toLowerCase().includes(term) ||
        student.campus.toLowerCase().includes(term),
    );
  }, [query, state.students]);

  const selected =
    state.students.find((student) => student.id === selectedId) ?? currentUser;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[var(--shell)] flex-col gap-4 px-4 py-6 lg:py-10">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="eyebrow">
          <span className="status-dot" />
          SocialHub · Kemang &amp; Sudirman
        </span>
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
      <section className="w-full lg:w-[46%]">
        <span className="eyebrow">
          <span className="status-dot" />
          Komunitas mahasiswa Kemang · Sudirman
        </span>
        <div className="mt-3 flex items-center gap-3">
          <Logo height={64} priority />
        </div>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          Kenalan dengan mahasiswa Kemang &amp; Sudirman, lalu buktikan instingmu
          lewat prediksi kegiatan kampus berbasis poin virtual. Tanpa uang asli,
          tanpa taruhan nyata.
        </p>

        <ul className="mt-5 space-y-2.5 text-sm">
          {HIGHLIGHTS.map((item) => (
            <li key={item.text} className="flex items-center gap-2.5">
              <span className="icon-tile h-8 w-8">
                <Icon name={item.icon} size={15} />
              </span>
              {item.text}
            </li>
          ))}
        </ul>

        <div className="card mt-6 overflow-hidden">
          <div className="px-4 py-4">
            <p className="eyebrow">
              <span
                className="status-dot"
                style={{ background: "var(--red)" }}
              />
              Dua gerbang kampus
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip chip-static">Kampus Kemang</span>
              <span className="chip chip-static">Kampus Sudirman</span>
              <span className="chip chip-static">7 jurusan</span>
            </div>
            <span className="gdots mt-4">
              <span style={{ background: "var(--blue)" }} />
              <span style={{ background: "var(--red)" }} />
              <span style={{ background: "var(--yellow)" }} />
              <span style={{ background: "var(--green)" }} />
            </span>
          </div>
          <div className="checker" aria-hidden="true" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="brand" icon="shield">
            Data demo lokal
          </Badge>
          <Badge tone="neutral" icon="coins">
            100% poin virtual
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => resetDemo()}
          className="btn btn-ghost mt-5"
        >
          <Icon name="bolt" size={16} />
          Reset data demo
        </button>
      </section>

      <section className="card w-full p-5 lg:w-[54%]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">
              <span className="status-dot" />
              Masuk cepat
            </p>
            <h2 className="display mt-1 text-[16px]">Pilih akun demo</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Masuk sebagai mahasiswa atau admin kampus.
            </p>
          </div>
          <Badge tone="neutral" icon="users">
            {state.students.length} akun
          </Badge>
        </div>

        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            <Icon name="search" size={16} />
          </span>
          <input
            className="input pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, program studi, atau kampus…"
            aria-label="Cari akun"
          />
        </div>

        <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedId(student.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[12px] border-2 border-[var(--ink)] p-3 text-left transition",
                student.id === selectedId
                  ? "bg-[var(--brand-soft)] shadow-[5px_5px_0_0_var(--shadow-color)]"
                  : "bg-[var(--surface)] shadow-[2px_2px_0_0_var(--shadow-color)] hover:-translate-y-0.5",
              )}
            >
              <Avatar
                name={student.name}
                hue={student.avatarHue}
                size={42}
                verified={student.verified}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">{student.name}</span>
                  {student.role === "admin" ? (
                    <Badge tone="warn" icon="shield">
                      Admin
                    </Badge>
                  ) : null}
                </span>
                <span className="block text-[11px] text-[var(--muted)]">
                  {student.program} · {student.batch} · Kampus {student.campus}
                </span>
              </span>
              <span className="text-right text-[11px] text-[var(--muted)]">
                <span className="block font-bold text-[var(--foreground)]">
                  {formatNumber(student.reputation)}
                </span>
                reputasi
              </span>
            </button>
          ))}
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted)]">
              Tidak ada akun dengan kata kunci itu.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn-primary mt-4 w-full"
          onClick={() => {
            login(selected.id);
            router.push("/");
          }}
        >
          <Icon name="logout" size={16} />
          Masuk sebagai {selected.name.split(" ")[0]}
        </button>
      </section>
      </div>
    </div>
  );
}
