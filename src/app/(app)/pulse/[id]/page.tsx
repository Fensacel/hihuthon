import { MarketDetail } from "@/components/MarketDetail";

export default async function MarketDetailPage({
  params,
}: PageProps<"/pulse/[id]">) {
  const { id } = await params;

  return <MarketDetail marketId={id} />;
}
