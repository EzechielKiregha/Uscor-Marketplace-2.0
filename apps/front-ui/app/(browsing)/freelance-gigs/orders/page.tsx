'use client';
import { useMe } from "@/lib/useMe";
import FreelanceOrderList from "../_components/FreelanceOrderList";

export default function FreelanceOrdersPage() {
  const userId = useMe().user?.id;

  if (!userId) {
    return <div className="text-center text-red-500">You must be logged in to view your orders.</div>;
  }
  return <FreelanceOrderList clientId={userId} />;
}