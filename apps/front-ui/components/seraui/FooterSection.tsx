"use client";

import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-card/50 backdrop-blur-sm border-t border-border text-foreground">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
					{/* Brand */}
					<div className="lg:col-span-4 space-y-5">
						<Link href="/" className="inline-flex items-center gap-2.5">
							<Image alt="logo" src="/logo.png" width={38} height={38} className="rounded-md" />
							<span className="font-extrabold text-xl tracking-tight text-foreground">Uscor</span>
						</Link>
						<p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
							Empowering creators and businesses through a seamless digital
							marketplace experience.
						</p>
						<div className="flex items-center gap-3 pt-1">
							<Link
								href="https://github.com/EzechielKiregha"
								className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							>
								<Github className="h-4 w-4" />
							</Link>
							<Link
								href="https://twitter.com/EzechielKiregh1"
								className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							>
								<Twitter className="h-4 w-4" />
							</Link>
							<Link
								href="https://www.linkedin.com/in/kambale-kiregha-125a60264"
								className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							>
								<Linkedin className="h-4 w-4" />
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div className="lg:col-span-2 space-y-4">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Platform</h3>
						<ul className="space-y-2.5">
							<li>
								<Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Marketplace
								</Link>
							</li>
							<li>
								<Link href="/freelance-gigs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Freelance Services
								</Link>
							</li>
							<li>
								<Link href="/all-businesses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Businesses
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources */}
					<div className="lg:col-span-2 space-y-4">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Resources</h3>
						<ul className="space-y-2.5">
							<li>
								<Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									FAQs
								</Link>
							</li>
							<li>
								<Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Pricing
								</Link>
							</li>
							<li>
								<Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div className="lg:col-span-4 space-y-4">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contact</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-2.5">
								<MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
								<span className="text-sm text-muted-foreground">IRIBA HOUSE, Kigali City, Gikondo</span>
							</li>
							<li className="flex items-center gap-2.5">
								<Mail className="h-4 w-4 text-muted-foreground shrink-0" />
								<a href="mailto:kireghacorp@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									kireghacorp@gmail.com
								</a>
							</li>
							<li className="flex items-center gap-2.5">
								<Phone className="h-4 w-4 text-muted-foreground shrink-0" />
								<a href="tel:+250790802201" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
									+250 790 802 201
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
					<p className="text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} Uscor Marketplace. All rights reserved.
					</p>
					<p className="text-xs text-muted-foreground">
						Crafted with <span className="text-red-500">&hearts;</span> by Uscor Team
					</p>
				</div>
			</div>
		</footer>
	);
}
