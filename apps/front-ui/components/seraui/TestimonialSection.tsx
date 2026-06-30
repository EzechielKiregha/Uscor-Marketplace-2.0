"use client";
import { Quote } from "lucide-react";
import type React from "react";

interface Testimonial {
	quote: string;
	author: string;
	role: string;
	avatar: string;
	avatarFallback: string;
	logo?: string;
}

interface TestimonialSectionProps {
	className?: string;
	title?: string;
	subtitle?: string;
	testimonials?: Testimonial[];
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
	className = "",
	title = "Trusted by Our Customers",
	subtitle = "Hear from users who love Uscor Marketplace for its seamless shopping and business tools.",
	testimonials = [
		{
			quote:
				"Uscor Marketplace has transformed our shopping experience. The intuitive platform and robust features make it a game-changer for buyers and sellers.",
			author: "Shekinah Tshikulila",
			role: "Entrepreneur",
			avatar: "https://i.pravatar.cc/150?img=1",
			avatarFallback: "https://placehold.co/48x48/6B7280/FFFFFF?text=ST",
		},
		{
			quote:
				"The platform's ease of use and powerful tools have saved us countless hours. It's an invaluable asset for our business.",
			author: "Jonathan Yombo",
			role: "Business Owner",
			avatar: "https://i.pravatar.cc/150?img=2",
			avatarFallback: "https://placehold.co/48x48/6B7280/FFFFFF?text=JY",
		},
		{
			quote:
				"The product listings and loyalty program are top-notch. Uscor has elevated our customer engagement.",
			author: "Yucel Farukşahan",
			role: "Retailer",
			avatar: "https://i.pravatar.cc/150?img=3",
			avatarFallback: "https://placehold.co/40x40/6B7280/FFFFFF?text=YF",
		},
		{
			quote:
				"Exceptional quality and attention to detail. Uscor is the best marketplace platform I've used.",
			author: "Rodrigo Aguilar",
			role: "Freelancer",
			avatar: "https://i.pravatar.cc/150?img=4",
			avatarFallback: "https://placehold.co/40x40/6B7280/FFFFFF?text=RA",
		},
	],
}) => {
	return (
		<div
			className={`flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 ${className}`}
		>
			<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-center max-w-4xl leading-tight mb-6">
				{title}
			</h1>
			<p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center max-w-3xl mb-8">
				{subtitle}
			</p>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-6xl">
				{/* Featured testimonial (large) */}
				<div className="bg-card p-8 rounded-xl flex flex-col justify-between border border-border backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
					<div className="mb-8">
						<Quote className="w-8 h-8 text-primary/40 mb-4" />
						<p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed">
							{testimonials[0].quote}
						</p>
					</div>
					<div className="flex items-center">
						<img
							src={testimonials[0].avatar}
							alt={testimonials[0].author}
							className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-border"
							onError={(e) => {
								e.currentTarget.onerror = null;
								e.currentTarget.src = testimonials[0].avatarFallback;
							}}
						/>
						<div>
							<p className="font-semibold text-foreground">
								{testimonials[0].author}
							</p>
							<p className="text-sm text-muted-foreground">
								{testimonials[0].role}
							</p>
						</div>
					</div>
				</div>

				{/* Right column */}
				<div className="flex flex-col gap-4">
					{/* Second testimonial (medium) */}
					<div className="bg-card p-8 rounded-xl flex flex-col justify-between border border-border backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
						<p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed mb-8">
							{testimonials[1].quote}
						</p>
						<div className="flex items-center">
							<img
								src={testimonials[1].avatar}
								alt={testimonials[1].author}
								className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-border"
								onError={(e) => {
									e.currentTarget.onerror = null;
									e.currentTarget.src = testimonials[1].avatarFallback;
								}}
							/>
							<div>
								<p className="font-semibold text-foreground">
									{testimonials[1].author}
								</p>
								<p className="text-sm text-muted-foreground">
									{testimonials[1].role}
								</p>
							</div>
						</div>
					</div>

					{/* Bottom two (small) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{testimonials.slice(2).map((testimonial) => (
							<div
								key={testimonial.author}
								className="bg-card p-6 rounded-xl flex flex-col justify-between border border-border backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
							>
								<p className="text-sm sm:text-base text-foreground leading-relaxed mb-6">
									{testimonial.quote}
								</p>
								<div className="flex items-center">
									<img
										src={testimonial.avatar}
										alt={testimonial.author}
										className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-border"
										onError={(e) => {
											e.currentTarget.onerror = null;
											e.currentTarget.src = testimonial.avatarFallback;
										}}
									/>
									<div>
										<p className="font-semibold text-foreground">
											{testimonial.author}
										</p>
										<p className="text-sm text-muted-foreground">
											{testimonial.role}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TestimonialSection;
