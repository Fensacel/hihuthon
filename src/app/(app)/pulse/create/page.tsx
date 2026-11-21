"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { CATEGORY_OPTIONS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import type { Campus, MarketCategory } from "@/lib/types";

const CAMPUS_OPTIONS: Array<Campus | "All"> = ["All", "Kemang", "Sudirman"];

const CAMPUS_LABEL: Record<Campus | "All", string> = {
  All: "Semua kampus",
  Kemang: "Kemang",
  Sudirman: "Sudirman",
};

const DEADLINES = [
  { hours: 6, label: "6 jam" },
  { hours: 12, label: "12 jam" },
  { hours: 24, label: "1 hari" },
  { hours: 48, label: "2 hari" },
  { hours: 72, label: "3 hari" },
  { hours: 168, label: "7 hari" },
];

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export default function CreateMarketPage() {
  const router = useRouter();
  const { currentUser, createMarket, notify } = useStore();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarketCategory>(CATEGORY_OPTIONS[0]);
  const [campus, setCampus] = useState<Campus | "All">(currentUser.campus);
  const [closesInHours, setClosesInHours] = useState(24);
  const [options, setOptions] = useState<string[]>(["", ""]);

  const filledOptions = options.map((option) => option.trim()).filter(Boolean);
  const valid =
    question.trim().length >= 10 &&
    description.trim().length >= 12 &&
    filledOptions.length >= MIN_OPTIONS &&
    filledOptions.length === new Set(filledOptions).size;

  return (
    <div className="space-y-4">
      <Link
        href="/pulse"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-brand-700"
      >
        <Icon name="back" size={15} />
        Semua prediksi
      </Link>

      <SectionHeader
        icon="target"
        title="Buat prediksi baru"
        subtitle="Pertanyaan harus bisa dijawab jelas benar atau salah"
      />

      <div className="card space-y-4 p-5">
        <Field
          label="Pertanyaan"
          hint="Minimal 10 karakter. Contoh: Tim basket Kemang menang lawan Sudirman?"
        >
          <input
            className="input"
            value={question}
            maxLength={140}
            placeholder="Tulis pertanyaan prediksi..."
            onChange={(event) => setQuestion(event.target.value)}
          />
        </Field>

        <Field
          label="Deskripsi"
          hint="Jelaskan konteks dan cara menentukan hasilnya agar tidak ambigu."
        >
          <textarea
            className="textarea"
            rows={4}
            value={description}
            maxLength={400}
            placeholder="Kapan, di mana, dan bagaimana hasilnya divalidasi..."
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori">
            <select
              className="select"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MarketCategory)
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Lingkup kampus">
            <select
              className="select"
              value={campus}
              onChange={(event) =>
                setCampus(event.target.value as Campus | "All")
              }
            >
              {CAMPUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {CAMPUS_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div>
          <p className="label">Opsi jawaban</p>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="input"
                  value={option}
                  maxLength={48}
                  placeholder={`Opsi ${index + 1}`}
                  onChange={(event) =>
                    setOptions((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? event.target.value : entry,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-ghost px-3"
                  disabled={options.length <= MIN_OPTIONS}
                  aria-label={`Hapus opsi ${index + 1}`}
                  onClick={() =>
                    setOptions((prev) =>
                      prev.filter((_, entryIndex) => entryIndex !== index),
                    )
                  }
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost mt-2"
            disabled={options.length >= MAX_OPTIONS}
            onClick={() => setOptions((prev) => [...prev, ""])}
          >
            <Icon name="plus" size={16} />
            Tambah opsi
          </button>
        </div>

        <Field label="Batas waktu prediksi">
          <div className="flex flex-wrap gap-2">
            {DEADLINES.map((option) => (
              <button
                key={option.hours}
                type="button"
                className="chip"
                data-active={closesInHours === option.hours}
                onClick={() => setClosesInHours(option.hours)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--background)] p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Opsi valid</span>
            <span className="font-semibold">{filledOptions.length} opsi</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--muted)]">Saldo poin kamu</span>
            <span className="font-semibold">
              {formatNumber(currentUser.points)} poin
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
            Poin hanya bisa dipakai untuk bertaruh, tidak bisa ditarik jadi uang.
            Kamu dapat +10 reputation saat prediksi dipublikasikan.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/pulse" className="btn btn-ghost flex-1">
            Batal
          </Link>
          <button
            type="button"
            className="btn btn-primary flex-1"
            disabled={!valid}
            onClick={() => {
              if (!valid) {
                notify("Lengkapi pertanyaan, deskripsi, dan opsi unik.", "error");
                return;
              }
              const id = createMarket({
                question: question.trim(),
                description: description.trim(),
                category,
                campus,
                options: filledOptions,
                closesInHours,
              });
              router.push(`/pulse/${id}`);
            }}
          >
            <Icon name="target" size={16} />
            Publikasikan prediksi
          </button>
        </div>
      </div>
    </div>
  );
}
