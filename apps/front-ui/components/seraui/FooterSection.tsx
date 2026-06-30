"use client";

import { Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-card border-t border-orange-400/60 dark:border-orange-500/70 text-foreground py-12 px-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
				{/* Brand */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						<Link href="/">
							<Image alt="logo" src="/logo.png" width={50} height={40} />
						</Link>
						<h3 className="text-2xl font-bold text-primary">Uscor</h3>
					</div>
					<p className="text-muted-foreground text-sm leading-relaxed">
						Empowering creators and businesses through a seamless digital
						marketplace experience.
					</p>
					<div className="flex space-x-4 pt-2">
						<Link
							href="https://github.com/EzechielKiregha"
							className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
						>
							<Github className="h-5 w-5" />
						</Link>
						<Link
							href="https://twitter.com/EzechielKiregh1"
							className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
						>
							<Twitter className="h-5 w-5" />
						</Link>
						<Link
							href="https://www.linkedin.com/in/kambale-kiregha-125a60264"
							className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
						>
							<Linkedin className="h-5 w-5" />
						</Link>
					</div>
				</div>

				{/* Quick Links */}
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-foreground">Quick Links</h3>
					<ul className="space-y-2">
						<li>
							<Link
								href="/"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								href="/marketplace/products"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Products
							</Link>
						</li>
						<li>
							<Link
								href="/freelance-gigs"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Freelance Services
							</Link>
						</li>
					</ul>
				</div>

				{/* Resources */}
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-foreground">Resources</h3>
					<ul className="space-y-2">
						<li>
							<Link
								href="/faq"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								FAQs
							</Link>
						</li>
						<li>
							<Link
								href="/privacy-policy"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Privacy Policy
							</Link>
						</li>
						<li>
							<Link
								href="/terms-of-service"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Terms of Service
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Careers
							</Link>
						</li>
					</ul>
				</div>

				{/* Contact */}
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-foreground">Contact Us</h3>
					<p className="text-muted-foreground text-sm">
						IRIBA HOUSE, Kigali City, Gikondo
					</p>
					<p className="text-muted-foreground text-sm">
						Email: kireghacorp@gmail.com
					</p>
					<p className="text-muted-foreground text-sm">
						Phone: +1 (800) 555-USOR
					</p>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="text-center text-muted-foreground text-sm pt-10 mt-10 border-t border-border">
				<p>
					&copy; {new Date().getFullYear()} Uscor Marketplace. All rights
					reserved.
				</p>
				<p className="mt-1">
					Crafted with <span className="text-red-500">&hearts;</span> by Uscor
					Team
				</p>
			</div>
		</footer>
	);
}
