import Image from "next/image";
import { cn } from "@/lib/utils";

// public/logo.png — 1024×1536 (2:3) transparent PNG, mark + "Social Hub" wordmark.
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 1536;

export function Logo({
  height = 40,
  className,
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT);

  return (
    <Image
      src="/logo.png"
      alt="Logo Social Hub"
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none object-contain", className)}
      style={{ height, width }}
    />
  );
}
