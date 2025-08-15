'use client'
import ChatThread from "../../_components/ChatThread";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  return <ChatThread params={params} />;
}