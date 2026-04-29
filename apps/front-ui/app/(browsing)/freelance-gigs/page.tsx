"use client";

import CategoryScrollArea from "@/components/CategoryScrollArea";
import FreelanceHero from "./_components/FreelanceHero";
import FreelanceServiceList from "./_components/FreelanceServiceList";

export default function FreelanceGigsPage() {
	return (
		<div className="flex flex-col min-h-screen bg-white  text-foreground">
			{/* Hero */}
			<FreelanceHero />

			{/* Main Content */}
			<main className="flex-1">
				<div className="">
					<div className="flex">
						{/* Sidebar: Category Scroll Area */}
						<CategoryScrollArea type="freelance" />

						{/* Main: Service List */}
						<div className="flex-1 min-w-0">
							<FreelanceServiceList />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
