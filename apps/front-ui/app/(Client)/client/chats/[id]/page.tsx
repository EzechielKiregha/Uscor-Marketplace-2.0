'use client'
import { useParams, useSearchParams } from "next/navigation";
import Loader from "@/components/seraui/Loader";
import ChatThread from "@/app/(Business)/business/_components/FirstChatThread";

export default function ChatThreadPage() {
  const params = useParams();
  const id = params.id;
  if (!id) {
    return (
      <><Loader loading={true} /><p className="text-center text-red-500">Chat ID is required</p></>);
  }
  return <ChatThread id={id} />;
}