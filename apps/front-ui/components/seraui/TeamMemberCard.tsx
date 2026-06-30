"use client";
import { GithubIcon, LinkedinIcon, TwitterIcon, Users } from "lucide-react";
import type React from "react";

// Add custom CSS for animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
	const styleSheet = document.createElement("style");
	styleSheet.textContent = styles;
	document.head.appendChild(styleSheet);
}

type TeamMember = {
	name: string;
	role: string;
	imageUrl: string;
	githubUrl?: string;
	linkedInUrl?: string;
	twitterUrl?: string;
};

const teamMembers: TeamMember[] = [
	{
		name: "Ezechiel Kiregha ",
		role: "Founder & CEO",
		imageUrl: "ME.jpeg",
		githubUrl: "https://github.com/EzechielKiregha",
		linkedInUrl: "https://www.linkedin.com/in/kambale-kiregha-125a60264",
		twitterUrl: "https://twitter.com/EzechielKiregh1",
	},
	{
		name: "Emily Jonson",
		role: "CEO",
		imageUrl:
			"https://i.pinimg.com/736x/8c/6d/db/8c6ddb5fe6600fcc4b183cb2ee228eb7.jpg",
	},
	{
		name: "Harshita Patel",
		role: "HR",
		imageUrl:
			"https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg",
	},
	{
		name: "Eleanor Morales",
		role: "HR",
		imageUrl:
			"https://i.pinimg.com/1200x/c2/4e/27/c24e271f2f992fd7e62e8c1e8d9b3e2f.jpg",
	},
];

interface TeamMemberCardProps {
	member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
	return (
		<div className="group flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-primary hover:-translate-y-1">
			<div className="relative w-32 h-32 md:w-40 md:h-40 mb-4">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-orange-400/30 to-accent/40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
				<img
					className="relative w-full h-full rounded-full object-cover ring-4 ring-background group-hover:ring-primary transition-all duration-300"
					src={member.imageUrl}
					alt={`Portrait of ${member.name}`}
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.onerror = null;
						target.src = `https://placehold.co/200x200/E2E8F0/4A5568?text=${member.name
							.split(" ")
							.map((n) => n[0])
							.join("")}`;
					}}
				/>
			</div>
			<h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
				{member.name}
			</h3>
			<p className="text-sm font-medium text-muted-foreground mb-4 px-3 py-1 bg-muted rounded-full">
				{member.role}
			</p>
			<div className="flex space-x-3">
				<a
					href={member.githubUrl}
					target="_blank"
					className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
					aria-label={`${member.name}'s GitHub profile`}
					rel="noopener"
				>
					<GithubIcon className="h-4 w-4" />
				</a>
				<a
					href={member.twitterUrl}
					target="_blank"
					className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
					aria-label={`${member.name}'s Twitter profile`}
					rel="noopener"
				>
					<TwitterIcon className="h-4 w-4" />
				</a>
				<a
					href={member.linkedInUrl}
					target="_blank"
					className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
					aria-label={`${member.name}'s LinkedIn profile`}
					rel="noopener"
				>
					<LinkedinIcon className="h-4 w-4" />
				</a>
			</div>
		</div>
	);
};

const TeamMemberSection: React.FC = () => {
	return (
		<section className="relative bg-gradient-to-br from-muted/50 via-background to-muted/50 font-sans transition-colors overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>

			<div className="relative w-full px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
				{/* Header Section */}
				<div className="w-full text-center mb-16">
					<div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
						<Users className="w-4 h-4 mr-2" />
						Meet Our Team
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Our Exceptional Team
					</h2>
					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
						Meet the talented professionals behind Uscor Marketplace, driving
						innovation for clients, businesses, and freelancers.
					</p>
				</div>

				{/* Team Grid */}
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 w-full">
					{teamMembers.map((member, index) => (
						<div
							key={member.name}
							className="animate-fade-in-up"
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							<TeamMemberCard member={member} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default TeamMemberSection;
