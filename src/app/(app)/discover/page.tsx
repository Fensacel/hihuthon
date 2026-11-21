"use client";

import Link from "next/link";
import { SwipeDeck } from "@/components/SwipeDeck";
import { Badge, Modal, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useState } from "react";

export default function DiscoverPage() {
  const [match, setMatch] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon="heart"
        title="Discover"
        subtitle="Geser ke kanan untuk menyukai, ke kiri untuk melewati"
        action={
          <Badge tone="brand" icon="sparkles">
            Kampus Kemang · Sudirman
          </Badge>
        }
      />

      <SwipeDeck
        onMatch={(matchId, partnerName) =>
          setMatch({ id: matchId, name: partnerName })
        }
      />

      <Modal
        open={match !== null}
        title="Ini match!"
        onClose={() => setMatch(null)}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => setMatch(null)}
            >
              Lanjut swipe
            </button>
            <Link
              href={match ? `/chat/${match.id}` : "/matches"}
              className="btn btn-primary flex-1"
              onClick={() => setMatch(null)}
            >
              <Icon name="chat" size={16} />
              Mulai chat
            </Link>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <span className="icon-tile h-14 w-14">
            <Icon name="heart" size={26} />
          </span>
          <p className="font-display text-xl font-bold">
            Kamu dan {match?.name.split(" ")[0]} saling menyukai!
          </p>
          <p className="text-sm text-[var(--muted)]">
            Sapa dulu dengan topik minat kalian, misalnya jadwal futsal atau kelas
            bersama. Poin tidak berkurang untuk chat.
          </p>
        </div>
      </Modal>
    </div>
  );
}
