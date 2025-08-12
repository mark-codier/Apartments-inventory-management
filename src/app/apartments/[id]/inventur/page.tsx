// server file (no "use client")
import InventurClient from "./InventurClient";

export default async function Page({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InventurClient aptId={id} />;
}
