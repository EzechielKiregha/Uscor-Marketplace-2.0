"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useActiveSection() {
	const [activeSection, setActiveSection] = useState<
		"dashboard" | "users" | "disputes" | "settings" | "announcements" | "audits" | "settlements" | "orders"
	>("dashboard");
	const router = useRouter();

	const handleActiveSectionChange = (
		section:
			| "dashboard"
			| "users"
			| "disputes"
			| "settings"
			| "announcements"
			| "audits"
			| "settlements"
			| "orders",
	) => {
		setActiveSection(section);
		router.push(`/admin?section=${section === "dashboard" ? "" : section}`);
		router.refresh();
	};

	return { activeSection, handleActiveSectionChange };
}
