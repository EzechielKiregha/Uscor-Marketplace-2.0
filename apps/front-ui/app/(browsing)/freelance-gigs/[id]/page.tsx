'use client';
import { useSearchParams } from "next/navigation";
import FreelanceServiceDetail from "../_components/FreelanceServiceDetail";
import Loader from "@/components/seraui/Loader";

export default function FreelanceServiceDetailPage() {
  const params = useSearchParams();
  const id = params.get('id');

  if (!id) {
    return (
      <><Loader loading={true} /><p className="text-center text-red-500">Chat ID is required</p></>);
  }

  return <FreelanceServiceDetail id={id} />;
}