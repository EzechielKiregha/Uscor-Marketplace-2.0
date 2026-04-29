"use client";
import type React from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AccordionLast from "./accordion-last";

const FaqPage: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen bg-background  text-foreground">
			<MaxWidthWrapper>
				<div className="py-8 mx-auto text-center flex flex-col items-center max-w-3xl">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
						Frequently Asked <span className="text-primary">Questions</span>
					</h1>
					<p className="mt-6 text-lg max-w-prose text-muted-foreground">
						Here are some of our most asked questions..
					</p>
				</div>
				<AccordionLast />
			</MaxWidthWrapper>
		</div>
	);
};

export default FaqPage;
