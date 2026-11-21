"use client";

import { useEffect, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cn, avatarBlock, initials } from "@/lib/utils";
import { useStore } from "@/lib/store";

export function Avatar({
  name,
  hue = 0,
  size = 48,
  verified = false,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  verified?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-[10px] border-2 border-[var(--ink)] font-black text-[#171717] shadow-[2px_2px_0_0_var(--shadow-color)]"
        style={{
          background: avatarBlock(hue),
          fontSize: Math.max(10, size * 0.36),
        }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      {verified ? (
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-[6px] border-2 border-[var(--ink)] bg-[var(--blue)] text-white"
          style={{ width: size * 0.42, height: size * 0.42 }}
          title="Akun terverifikasi"
        >
          <Icon name="check" size={Math.max(8, size * 0.2)} strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}

type BadgeTone = "brand" | "success" | "warn" | "danger" | "neutral";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-[var(--orange)] text-[#171717]",
  success: "bg-[var(--green)] text-[#171717]",
  warn: "bg-[var(--yellow)] text-[#171717]",
  danger: "bg-[var(--red)] text-[#171717]",
  neutral: "bg-[var(--surface)] text-[var(--ink)]",
};

export function Badge({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] border-2 border-[var(--ink)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] shadow-[2px_2px_0_0_var(--shadow-color)]",
        TONES[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  step,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  action?: ReactNode;
  step?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-[var(--ink)] pb-3">
      <div className="flex min-w-0 items-center gap-3">
        {step ? <span className="step">{step}</span> : null}
        <div className="min-w-0">
          <h2 className="display flex items-center gap-2 text-[17px]">
            {icon ? (
              <Icon name={icon} size={18} className="text-[var(--orange)]" />
            ) : null}
            {title}
          </h2>
          {subtitle ? <p className="eyebrow mt-1">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

const STAT_TONES: Record<BadgeTone, string> = {
  brand: "bg-[var(--orange)]",
  success: "bg-[var(--green)]",
  warn: "bg-[var(--yellow)]",
  danger: "bg-[var(--red)]",
  neutral: "bg-[var(--surface-2)]",
};

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: IconName;
  tone?: BadgeTone;
}) {
  return (
    <div className="card-flat overflow-hidden p-3.5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 border-b-2 border-[var(--ink)]",
          STAT_TONES[tone],
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
          {label}
        </p>
        {icon ? (
          <span className={cn("icon-tile h-7 w-7", STAT_TONES[tone])}>
            <Icon name={icon} size={14} />
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon = "sparkles",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      <span className="icon-tile h-14 w-14">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="display text-[15px]">{title}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "success" | "warn";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const colors = {
    brand: "bg-[var(--orange)]",
    success: "bg-[var(--green)]",
    warn: "bg-[var(--yellow)]",
  } as const;
  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full border-2 border-[var(--ink)] bg-[var(--surface-2)]",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", colors[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#171717]/65 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="card animate-pop flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-b-none sm:rounded-b-[var(--radius-card)]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b-2 border-[var(--ink)] px-5 py-4">
          <h3 className="display text-base">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost !px-2 !py-1.5"
            aria-label="Tutup"
          >
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="border-t-2 border-[var(--ink)] px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

const TOAST_STYLE = {
  success: "bg-[var(--green)] text-[#171717]",
  info: "bg-[var(--blue)] text-white",
  error: "bg-[var(--red)] text-[#171717]",
} as const;

const TOAST_ICON: Record<keyof typeof TOAST_STYLE, IconName> = {
  success: "check",
  info: "info",
  error: "alert",
};

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={cn(
            "animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-[10px] border-2 border-[var(--ink)] px-3.5 py-3 text-left text-sm font-bold shadow-[4px_4px_0_0_var(--shadow-color)]",
            TOAST_STYLE[toast.kind],
          )}
        >
          <Icon name={TOAST_ICON[toast.kind]} size={16} className="mt-0.5" />
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  );
}

