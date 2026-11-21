"use client";

import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/** Must match the pre-paint script key in `app/layout.tsx`. */
const THEME_STORAGE_KEY = "socialhub-theme";

export type ThemeMode = "light" | "dark";

/**
 * Light/Dark switch. The icon pair is toggled purely by CSS (`[data-theme]`
 * selectors in globals.css) so the button never renders the wrong glyph during
 * hydration — only the click handler needs the DOM.
 */
export function ThemeToggle({
  className,
  label = "Ganti tema terang atau gelap",
}: {
  className?: string;
  label?: string;
}) {
  const toggle = () => {
    const root = document.documentElement;
    const next: ThemeMode =
      root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage can be unavailable in private mode — theme still applies */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("btn btn-ghost !px-2.5 !py-2", className)}
      aria-label={label}
      title={label}
    >
      <Icon name="sun" size={16} className="theme-icon-sun" />
      <Icon name="moon" size={16} className="theme-icon-moon" />
    </button>
  );
}