"use client";
import { useSearchParams } from "next/navigation";
import PageSkeleton from "@/components/skeletons/PageSkeleton";
import FreelanceServiceDetail from "../_components/FreelanceServiceDetail";

export default function FreelanceServiceDetailPage() {
	const params = useSearchParams();
	const id = params.get("id");

	if (!id) {
		return (
			<>
				<PageSkeleton variant="centered" />
				<p className="text-center text-red-500">Chat ID is required</p>
			</>
		);
	}

	return <FreelanceServiceDetail id={id} />;
}
