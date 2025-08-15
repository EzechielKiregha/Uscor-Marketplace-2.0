'use client'
import { useSearchParams } from "next/navigation";
import ChatThread from "../../_components/ChatThread";
import Loader from "@/components/seraui/Loader";

export default function ChatThreadPage() {
  const params = useSearchParams();
  const id = params.get('id');
  if (!id) {
    return (
      <><Loader loading={true} /><p className="text-center text-red-500">Chat ID is required</p></>);
  }
  return <ChatThread id={id} />;
}