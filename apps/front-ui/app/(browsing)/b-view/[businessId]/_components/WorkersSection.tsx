// app/business/[id]/_components/WorkersSection.tsx
"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, MessageSquare, Search, Star, Users } from "lucide-react";
import { useState } from "react";

interface WorkersSectionProps {
	workers: any[];
	loading: boolean;
	business: any;
}

export default function WorkersSection({
	workers,
	loading,
	business,
}: WorkersSectionProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedRole, setSelectedRole] = useState<string | null>(null);

	// Extract unique roles from workers
	const roles = Array.from(
		new Set(workers.map((worker) => worker.role).filter(Boolean)),
	);

	const filteredWorkers = workers.filter((worker) => {
		const matchesSearch = worker.fullName
			.toLowerCase()
			.includes(searchQuery.toLowerCase());

		const matchesRole = selectedRole ? worker.role === selectedRole : true;

		return matchesSearch && matchesRole;
	});

	if (loading) {
		return (
			<div className="bg-card border hover:border-primary  rounded-lg p-6">
				<div className="flex justify-center items-center h-64">
					<div className="text-center">
						<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading workers...</p>
					</div>
				</div>
			</div>
		);
	}

	if (filteredWorkers.length === 0) {
		return (
			<div className="bg-card border hover:border-primary  rounded-lg p-6">
				<EmptyState
					icon={emptyStateIcons.customers}
					title="No workers found"
					description={searchQuery || selectedRole
						? "Try adjusting your search or filter criteria"
						: "This business hasn't added workers yet"}
					action={(searchQuery || selectedRole) ? {
						label: "Clear Filters",
						onClick: () => {
							setSearchQuery("");
							setSelectedRole(null);
						},
						variant: "outline",
					} : undefined}
					compact
				/>
			</div>
		);
	}

	return (
		<div className="bg-card border hover:border-primary  rounded-lg overflow-hidden">
			{/* Header */}
			<div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="relative w-full sm:w-64">
					<Input
						type="text"
						placeholder="Search workers..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSelectedRole(null)}
						>
							<Filter className="h-4 w-4 mr-2" />
							{selectedRole ? selectedRole : "All Roles"}
						</Button>
						{roles.length > 0 && (
							<div className="absolute right-0 mt-2 w-48 bg-card border hover:border-primary  rounded-md shadow-lg z-10 hidden group-hover:block">
								<div className="py-1">
									<button
										onClick={() => setSelectedRole(null)}
										className="w-full px-4 py-2 text-left hover:bg-muted"
									>
										All Roles
									</button>
									{roles.map((role) => (
										<button
											key={role}
											onClick={() => setSelectedRole(role)}
											className="w-full px-4 py-2 text-left hover:bg-muted"
										>
											{role}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Workers Grid */}
			<div className="p-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredWorkers.map((worker) => (
						<div
							key={worker.id}
							className="border hover:border-primary  rounded-lg overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="p-4 text-center bg-muted border-b border-border">
								<div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2 border-border">
									{worker.avatar ? (
										<img
											src={worker.avatar}
											alt={worker.fullName}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold">
											{worker.fullName.charAt(0)}
										</div>
									)}
								</div>
								<h3 className="font-medium text-lg">{worker.fullName}</h3>
								{worker.role && (
									<p className="text-sm text-muted-foreground mt-1">
										{worker.role}
									</p>
								)}
							</div>

							<div className="p-4">
								{worker.bio && (
									<p className="text-sm text-muted-foreground line-clamp-3 mb-3">
										{worker.bio}
									</p>
								)}

								<div className="flex justify-between items-center">
									<div className="flex items-center">
										<Star className="h-4 w-4 text-warning mr-1" />
										<span className="text-sm">{worker.averageRating?.toFixed(1) || "New"}</span>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="flex items-center gap-1"
									>
										<MessageSquare className="h-3 w-3" />
										Message
									</Button>
								</div>

								{worker.specialties && worker.specialties.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1">
										{worker.specialties
											.slice(0, 3)
											.map((specialty: string, index: number) => (
												<span
													key={index}
													className="text-xs bg-muted px-2 py-1 rounded-full"
												>
													{specialty}
												</span>
											))}
										{worker.specialties.length > 3 && (
											<span className="text-xs bg-muted px-2 py-1 rounded-full">
												+{worker.specialties.length - 3}
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			</div>
	);
}
