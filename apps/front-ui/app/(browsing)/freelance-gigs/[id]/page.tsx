'use client';
import FreelanceServiceDetail from "../_components/FreelanceServiceDetail";

export default function FreelanceServiceDetailPage({ params }: { params: { id: string } }) {
  return <FreelanceServiceDetail params={params} />;
}