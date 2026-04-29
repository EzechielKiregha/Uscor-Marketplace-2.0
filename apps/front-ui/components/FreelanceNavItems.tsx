"use client";

import { useEffect, useRef, useState } from "react";
import { FREELANCE_SERVICE_CATEGORIES } from "@/config/freelance-categories";
import { useOnClickOutside } from "@/hooks/use-on-outside-click";
import FreelanceNavItem from "./FreelanceNavItem";

const FreelanceNavItems = () => {
	const [activeIndex, setActiveIndex] = useState<null | number>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setActiveIndex(null);
			}
		};

		document.addEventListener("keydown", handler);

		return document.removeEventListener("keydown", handler);
	}, []);
	const isAnyOpen = activeIndex !== null;
	const navRef = useRef<HTMLDivElement | null>(null);
	useOnClickOutside(navRef, () => setActiveIndex(null));

	return (
		<div className="flex gap-4 h-full">
			{FREELANCE_SERVICE_CATEGORIES.map((category, i) => {
				const handleOpen = () => {
					if (activeIndex === i) {
						setActiveIndex(null);
					} else {
						setActiveIndex(i);
					}
				};

				const isOpen = i === activeIndex;
				return (
					<FreelanceNavItem
						key={i}
						category={category}
						handleOpen={handleOpen}
						isOpen={isOpen}
						isAnyOpen={isAnyOpen}
					/>
				);
			})}
		</div>
	);
};

export default FreelanceNavItems;
