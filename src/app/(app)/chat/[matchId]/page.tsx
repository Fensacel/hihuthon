import Link from "next/link";
import { ChatPanel } from "@/components/ChatPanel";
import { Icon } from "@/components/Icon";

export default async function ChatPage({ params }: PageProps<"/chat/[matchId]">) {
  const { matchId } = await params;

  return (
    <div className="space-y-3">
      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--orange)]"
      >
        <Icon name="back" size={15} />
        Semua chat
      </Link>
      <ChatPanel matchId={matchId} />
    </div>
  );
}
