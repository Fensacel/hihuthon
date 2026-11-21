import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "heart"
  | "close"
  | "pulse"
  | "chat"
  | "user"
  | "trophy"
  | "shield"
  | "plus"
  | "flag"
  | "check"
  | "back"
  | "send"
  | "sparkles"
  | "search"
  | "pin"
  | "calendar"
  | "users"
  | "target"
  | "trending"
  | "logout"
  | "edit"
  | "info"
  | "alert"
  | "clock"
  | "coins"
  | "star"
  | "menu"
  | "verified"
  | "bolt";

const PATHS: Record<IconName, string> = {
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z",
  heart:
    "M12 20.5S4.5 16 4.5 10.6A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 7.5 3.2C19.5 16 12 20.5 12 20.5z",
  close: "M6 6l12 12M18 6 6 18",
  pulse: "M3 12h4l2.5-6 3.5 12 2.5-6H21",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  trophy:
    "M8 4h8v5a4 4 0 0 1-8 0zM8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M12 13v5M9 20h6",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  plus: "M12 5v14M5 12h14",
  flag: "M6 21V4h8l-1 3h6l-2 5 2 5H7M6 4h5",
  check: "M4 12.5 9 17.5 20 6.5",
  back: "M19 12H5M11 6l-6 6 6 6",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  sparkles:
    "M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5.5 15l.6 1.6 1.6.6-1.6.6L5.5 20l-.6-1.6-1.6-.6 1.6-.6z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.5-4.5",
  pin: "M12 22s6-6 6-11a6 6 0 1 0-12 0c0 5 6 11 6 11zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  calendar:
    "M7 3v3M17 3v3M4 8h16M6 5h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 20v-1a4 4 0 0 0-3-3.9M15.5 3.2a4 4 0 0 1 0 7.6",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  trending: "M3 17l6-6 4 4 8-8M15 7h6v6",
  logout: "M15 17l5-5-5-5M20 12H9M12 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h7",
  edit: "M4 20h4l10-10-4-4L4 16zM14 6l4 4",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
  alert: "M12 3l9 17H3zM12 9v5M12 17.5h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  coins: "M9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  star: "M12 3l2.9 5.9 6.1.9-4.4 4.3 1 6.1L12 17.8 6.4 20.2l1-6.1L3 9.8l6.1-.9z",
  menu: "M4 7h16M4 12h16M4 17h16",
  verified:
    "M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1L2.7 15.5 4 12.6 2.7 9.7l2.8-1.6.9-3.1 3.2.3zM9 12l2 2 4-4",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6z",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
