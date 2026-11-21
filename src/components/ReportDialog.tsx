"use client";

import { useState } from "react";
import { Field, Modal } from "./ui";
import { REPORT_REASONS } from "@/lib/seed";
import { useStore } from "@/lib/store";

export function ReportDialog({
  open,
  onClose,
  targetStudentId,
  targetMarketId,
  targetLabel,
}: {
  open: boolean;
  onClose: () => void;
  targetStudentId?: string | null;
  targetMarketId?: string | null;
  targetLabel?: string;
}) {
  const { submitReport } = useStore();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");

  const reset = () => {
    setReason(REPORT_REASONS[0]);
    setDetails("");
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Laporkan ke admin"
      onClose={close}
      footer={
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost flex-1" onClick={close}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1"
            disabled={details.trim().length < 8}
            onClick={() => {
              submitReport({
                reason,
                details,
                targetStudentId: targetStudentId ?? null,
                targetMarketId: targetMarketId ?? null,
              });
              close();
            }}
          >
            Kirim laporan
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {targetLabel ? (
          <div className="rounded-[12px] border-2 border-[var(--ink)] bg-[var(--surface-2)] p-3 text-xs">
            <p className="font-semibold uppercase tracking-wide text-[var(--muted)]">
              Dilaporkan
            </p>
            <p className="mt-1 text-sm font-semibold">{targetLabel}</p>
          </div>
        ) : null}

        <Field label="Alasan">
          <select
            className="select"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            {REPORT_REASONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Detail" hint="Minimal 8 karakter agar admin bisa menindaklanjuti.">
          <textarea
            className="textarea"
            rows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Jelaskan apa yang terjadi…"
          />
        </Field>
      </div>
    </Modal>
  );
}
