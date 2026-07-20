"use client";

import {
    Menu,
    MoonIcon,
    Search,
    SidebarClose,
    SidebarOpen,
    SunIcon,
    X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import NotificationsPopover from "@/components/seraui/Notifications";
import UserDropdown from "@/components/seraui/UserDrodown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sidebarItems } from "./BusinessSidebar";

interface BusinessHeaderProps {
	business: any;
	isSidebarOpen?: boolean;
	toggleSidebar?: () => void;
}

export default function BusinessHeader({
	business,
	isSidebarOpen,
	toggleSidebar,
}: BusinessHeaderProps) {
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<header className="border-b border-border bg-card h-14 flex items-center justify-between px-4 md:px-6">
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				className="md:hidden"
				onClick={() => setShowMobileMenu(!showMobileMenu)}
			>
				<Menu className="h-5 w-5" />
			</Button>

			{/* Desktop sidebar toggle + search */}
			<div className="hidden md:flex items-center gap-3 flex-1">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => toggleSidebar?.()}
					aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
				>
					{isSidebarOpen ? (
						<SidebarClose className="h-4 w-4" />
					) : (
						<SidebarOpen className="h-4 w-4" />
					)}
				</Button>

				<div className="relative max-w-md flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search products, orders, customers..."
						className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-colors"
					/>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				<NotificationsPopover />
				<Button
					onClick={toggleTheme}
					variant="ghost"
					size="icon"
					aria-label="Toggle theme"
				>
					{theme === "dark" ? (
						<SunIcon className="h-4 w-4" />
					) : (
						<MoonIcon className="h-4 w-4" />
					)}
				</Button>
				<UserDropdown />
			</div>

			{/* Mobile menu overlay */}
			{showMobileMenu && (
				<div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 md:hidden">
					<div className="p-4 border-b border-border flex justify-between items-center">
						<div className="flex items-center gap-3">
							{business.avatar ? (
								<img
									src={business.avatar}
									alt={business.name}
									className="w-8 h-8 rounded-full object-cover"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
									{business.name?.charAt(0)}
								</div>
							)}
							<div>
								<h2 className="font-semibold text-sm text-foreground">
									{business.name}
								</h2>
								<p className="text-xs text-muted-foreground">
									Business Account
								</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowMobileMenu(false)}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					<nav className="p-2 space-y-0.5">
						{sidebarItems.map((item) => (
							<a
								key={item.href}
								href={item.href}
								className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								onClick={() => setShowMobileMenu(false)}
							>
								<item.icon className="w-4 h-4" />
								<span>{item.label}</span>
								{item.badge && (
									<span className="ml-auto bg-primary text-primary-foreground text-[10px] font-medium rounded-full px-1.5 py-0.5">
										3
									</span>
								)}
							</a>
						))}
					</nav>
				</div>
			)}
		</header>
	);
}
