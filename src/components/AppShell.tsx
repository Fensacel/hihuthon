"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { Avatar } from "./ui";
import { cn, formatNumber } from "@/lib/utils";
import { unreadTotal } from "@/lib/selectors";
import { useStore } from "@/lib/store";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
  badge?: number;
}

const ACCENTS = ["var(--blue)", "var(--red)", "var(--yellow)", "var(--green)"];

const TICKER = [
  "Swipe profil",
  "Chat & match",
  "Prediksi kampus",
  "Poin virtual",
  "Kemang",
  "Sudirman",
  "Papan peringkat",
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, currentUser, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const loggedIn = Boolean(state.currentUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!loggedIn) router.replace("/login");
  }, [loggedIn, router]);

  // Four Google-colour progress segments, driven by scroll position.
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      fills.current.forEach((el, index) => {
        if (!el) return;
        const value = Math.min(1, Math.max(0, progress * 4 - index));
        el.style.transform = `scaleX(${value})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Logo height={80} priority />
        <p className="eyebrow">Memuat ekosistem kampus Kemang &amp; Sudirman</p>
        <div className="skeleton h-2 w-44 rounded-full" />
      </div>
    );
  }

  const unread = unreadTotal(state);
  const me = currentUser;
  const allItems: NavItem[] = [
    { href: "/", label: "Beranda", icon: "home" },
    { href: "/discover", label: "Discover", icon: "heart" },
    { href: "/pulse", label: "Pulse", icon: "pulse" },
    { href: "/matches", label: "Chat", icon: "chat", badge: unread },
    { href: "/leaderboard", label: "Peringkat", icon: "trophy" },
    { href: "/profile", label: "Profil", icon: "user" },
    { href: "/admin", label: "Admin", icon: "shield", adminOnly: true },
  ];
  const items = allItems.filter(
    (item) => !item.adminOnly || me.role === "admin",
  );
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed inset-x-0 top-0 z-[60] flex h-[3px]">
        {ACCENTS.map((accent, index) => (
          <span key={accent} className="relative h-full flex-1 bg-[var(--line)]">
            <span
              ref={(el) => {
                fills.current[index] = el;
              }}
              className="absolute inset-0 origin-left"
              style={{ background: accent, transform: "scaleX(0)" }}
            />
          </span>
        ))}
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--ink)] bg-[var(--surface-deep)] backdrop-blur">
        <div className="mx-auto flex h-[var(--header)] w-full max-w-[var(--shell)] items-center gap-3 px-[var(--gutter)]">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Logo height={42} priority />
            <span className="eyebrow hidden sm:block">Kemang · Sudirman</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {items.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] transition",
                  isActive(item.href)
                    ? "text-[var(--ink)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                {item.label}
                {item.badge ? (
                  <span className="ml-1.5 bg-[var(--red)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
                {isActive(item.href) ? (
                  <span
                    className="absolute inset-x-2 bottom-0 h-[3px]"
                    style={{ background: ACCENTS[index % 4] }}
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <span className="chip chip-static hidden sm:inline-flex">
              <Icon name="coins" size={12} />
              {formatNumber(me.points)}
            </span>
            <Link
              href="/profile"
              aria-label="Profil"
              className="hidden sm:block"
            >
              <Avatar name={me.name} hue={me.avatarHue} size={32} />
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              aria-label="Keluar"
              className="btn btn-ghost hidden !px-3 !py-2 sm:inline-flex"
            >
              <Icon name="logout" size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="btn btn-ghost !px-3 !py-2 lg:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={16} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-[var(--ink)] bg-[var(--surface)] px-[var(--gutter)] py-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 border px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
                    isActive(item.href)
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--line)] text-[var(--muted)]",
                  )}
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                  {item.badge ? (
                    <span className="ml-auto bg-[var(--red)] px-1.5 font-mono text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          {[...TICKER, ...TICKER].map((word, index) => (
            <span key={`${word}-${index}`} className="strip-item">
              {word}
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-[var(--shell)] flex-1 px-[var(--gutter)] pb-28 pt-6 lg:pb-14">
        {children}
      </main>

      <footer className="border-t border-[var(--ink)] bg-[var(--surface)]">
        <div className="strip mb-0 flex justify-around gap-6 overflow-hidden py-3">
          {["Discover", "Match", "Prediksi", "Peringkat"].map((word) => (
            <span key={word} className="strip-item">
              {word}
            </span>
          ))}
        </div>
        <div className="mx-auto grid w-full max-w-[var(--shell)] gap-8 px-[var(--gutter)] py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo height={44} />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
              Aplikasi sosial mahasiswa Kemang &amp; Sudirman: swipe profil,
              chat, lalu uji dugaanmu lewat prediksi kegiatan kampus berbasis
              poin virtual.
            </p>
            <span className="gdots mt-3">
              <span style={{ background: "var(--blue)" }} />
              <span style={{ background: "var(--red)" }} />
              <span style={{ background: "var(--yellow)" }} />
              <span style={{ background: "var(--green)" }} />
            </span>
          </div>

          <div>
            <p className="eyebrow">
              <span className="status-dot" />
              Kenali kami
            </p>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/", label: "Beranda" },
                { href: "/discover", label: "Discover" },
                { href: "/matches", label: "Chat & match" },
                { href: "/leaderboard", label: "Peringkat" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold text-[var(--ink)] hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">
              <span
                className="status-dot"
                style={{ background: "var(--red)" }}
              />
              Program
            </p>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/pulse", label: "Prediksi kampus" },
                { href: "/pulse/create", label: "Buat pasar baru" },
                { href: "/profile", label: "Profil & minat" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold text-[var(--ink)] hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">
              <span
                className="status-dot"
                style={{ background: "var(--yellow)" }}
              />
              Terbuka untuk siapa saja
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Mahasiswa Kemang maupun Sudirman, dari jurusan apa pun,
              disatukan oleh kegiatan kampus dan poin virtual.
            </p>
            <Link href="/pulse/create" className="btn btn-primary mt-4">
              <Icon name="plus" size={14} />
              Buat prediksi
            </Link>
          </div>
        </div>
        <p className="eyebrow mx-auto w-full max-w-[var(--shell)] px-[var(--gutter)] pb-6">
          © 2026 SocialHub · Kemang &amp; Sudirman
        </p>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ink)] bg-[var(--surface)] lg:hidden">
        <div className="grid grid-cols-5">
          {items.slice(0, 5).map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em]",
                isActive(item.href)
                  ? "text-[var(--ink)]"
                  : "text-[var(--muted)]",
              )}
            >
              {isActive(item.href) ? (
                <span
                  className="absolute inset-x-4 top-0 h-[3px]"
                  style={{ background: ACCENTS[index % 4] }}
                />
              ) : null}
              <Icon name={item.icon} size={17} />
              {item.label}
              {item.badge ? (
                <span className="absolute right-3 top-1.5 bg-[var(--red)] px-1 font-mono text-[8px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
