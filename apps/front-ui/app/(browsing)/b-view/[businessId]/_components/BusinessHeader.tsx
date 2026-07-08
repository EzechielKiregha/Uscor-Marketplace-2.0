"use client";

import {
    Bookmark,
    BookmarkPlus,
    Globe,
    MapPin,
    MessageSquare,
    Share,
    Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/useMe";

interface BusinessHeaderProps {
	business: any;
	isCurrentUser: boolean;
}

export default function BusinessHeader({
	business,
	isCurrentUser,
}: BusinessHeaderProps) {
	const { user } = useMe();
	const [isBookmarked, setIsBookmarked] = useState(false);

	// In a real app, this would check if the business is bookmarked
	useEffect(() => {
		// Check if business is bookmarked
		const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
		setIsBookmarked(bookmarks.includes(business.id));
	}, [business.id]);

	const toggleBookmark = () => {
		const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
		if (isBookmarked) {
			const newBookmarks = bookmarks.filter((id: string) => id !== business.id);
			localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
			setIsBookmarked(false);
		} else {
			bookmarks.push(business.id);
			localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
			setIsBookmarked(true);
		}
	};

	// Determine business type icon and label
	const getBusinessTypeDetails = () => {
		switch (business.businessType) {
			case "ARTISAN":
				return { icon: "🎨", label: "Artisan & Handcrafted Goods" };
			case "BOOKSTORE":
				return { icon: "📚", label: "Bookstore & Stationery" };
			case "ELECTRONICS":
				return { icon: "🔌", label: "Electronics & Gadgets" };
			case "HARDWARE":
				return { icon: "🔨", label: "Hardware & Tools" };
			case "GROCERY":
				return { icon: "🛒", label: "Grocery & Convenience" };
			case "CAFE":
				return { icon: "☕", label: "Café & Coffee Shops" };
			case "RESTAURANT":
				return { icon: "🍽️", label: "Restaurant & Dining" };
			case "RETAIL":
				return { icon: "🏬", label: "Retail & General Stores" };
			case "BAR":
				return { icon: "🍷", label: "Bar & Pub" };
			case "CLOTHING":
				return { icon: "👕", label: "Clothing & Accessories" };
			default:
				return { icon: "🏢", label: "Business" };
		}
	};

	const businessType = getBusinessTypeDetails();

	// Determine KYC badge
	const getKycBadge = () => {
		if (business.kycStatus === "VERIFIED") {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
					<Star className="h-3 w-3 mr-1" />
					Verified Business
				</span>
			);
		}
		return null;
	};

	return (
		<div className="bg-card border border-border hover:border-primary hover:bg-primary/5 rounded-xl overflow-hidden">
			{/* Cover Image */}
			<div className="h-48 md:h-64 relative">
				{business.coverImage ? (
					<img
						src={business.coverImage}
						alt={`${business.name} cover`}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-muted flex items-center justify-center">
						<Globe className="h-12 w-12 text-muted-foreground" />
					</div>
				)}

				{/* Business Avatar */}
				<div className="absolute -bottom-12 left-6 w-24 h-24 border-4 border-background rounded-full overflow-hidden bg-card shadow-lg">
					{business.avatar ? (
						<img
							src={business.avatar}
							alt={`${business.name} avatar`}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold">
							{business.name.charAt(0)}
						</div>
					)}
				</div>
			</div>

			{/* Business Info */}
			<div className="pt-12 pb-6 px-6">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<h1 className="text-2xl font-bold">{business.name}</h1>
							{getKycBadge()}
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
							<span>
								{businessType.icon} {businessType.label}
							</span>
							{business.address && (
								<>
									<span>•</span>
									<span className="flex items-center gap-1">
										<MapPin className="h-3 w-3" />
										{business.address}
									</span>
								</>
							)}
						</div>

						<p className="text-muted-foreground max-w-2xl">
							{business.description ||
								"This business has not provided a description yet."}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-2">
						{!isCurrentUser && (
							<>
								<Button variant="default">
									<MessageSquare className="h-4 w-4 mr-2" />
									Message
								</Button>
								<Button variant="outline" size="icon" onClick={toggleBookmark}>
									{isBookmarked ? (
										<Bookmark className="h-4 w-4" />
									) : (
										<BookmarkPlus className="h-4 w-4" />
									)}
								</Button>
								<Button variant="outline" size="icon">
									<Share className="h-4 w-4" />
								</Button>
							</>
						)}
						{isCurrentUser && <Button variant="outline">Edit Profile</Button>}
					</div>
				</div>
			</div>
		</div>
	);
}
