"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
	Building2,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Search,
	Users,
	XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_USERS } from "@/graphql/admin.gql";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";

export default function WorkerManagement() {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const { data, loading } = useQuery(GET_USERS, {
		variables: {
			input: { search: search || undefined, page: 1, limit: 100 },
			includeBusinesses: false,
			includeClients: false,
			includeWorkers: true,
			includeAdmins: false,
		},
	});

	const workers = data?.all_workers?.items || [];
	const filtered = roleFilter
		? workers.filter((w: any) => w.role === roleFilter)
		: workers;

	// Collect unique roles for the filter
	const roles = Array.from(new Set(workers.map((w: any) => w.role).filter(Boolean)));

	if (loading) return <TableSkeleton />;

	return (
		<div className="bg-card border border-border rounded-lg overflow-hidden">
			<div className="p-4 bg-muted border-b border-border">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h2 className="text-section-title flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							Worker Management
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							{filtered.length} workers across all businesses
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="relative w-full sm:w-64">
							<Input
								placeholder="Search workers..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
							/>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						</div>
						{roles.length > 1 && (
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								className="p-2 border border-border rounded-md bg-background text-sm"
							>
								<option value="">All Roles</option>
								{roles.map((r: any) => (
									<option key={r} value={r}>
										{r}
									</option>
								))}
							</select>
						)}
					</div>
				</div>
			</div>

			<div className="divide-y divide-border">
				{filtered.length === 0 ? (
					<div className="p-6">
						<EmptyState
							icon={emptyStateIcons.users}
							title="No workers found"
							description="Try adjusting your search or filters"
							compact
						/>
					</div>
				) : (
					filtered.map((worker: any) => (
						<div key={worker.id} className="hover:bg-muted/30 transition-colors">
							<div
								className="flex items-center justify-between p-4 cursor-pointer"
								onClick={() =>
									setExpandedId(expandedId === worker.id ? null : worker.id)
								}
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									{worker.avatar ? (
										<img
											src={worker.avatar}
											alt=""
											className="w-10 h-10 rounded-full object-cover shrink-0"
										/>
									) : (
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											{worker.fullName?.charAt(0)}
										</div>
									)}
									<div className="min-w-0">
										<p className="font-medium truncate">{worker.fullName}</p>
										<p className="text-xs text-muted-foreground truncate">
											{worker.email}
										</p>
									</div>
								</div>

								<div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
									<span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
										{worker.role?.toLowerCase()}
									</span>
									<span
										className={`flex items-center gap-1 ${
											worker.isVerified
												? "text-success"
												: "text-muted-foreground"
										}`}
									>
										{worker.isVerified ? (
											<CheckCircle className="h-3.5 w-3.5" />
										) : (
											<XCircle className="h-3.5 w-3.5" />
										)}
										{worker.isVerified ? "Verified" : "Unverified"}
									</span>
									{worker.business && (
										<span className="flex items-center gap-1 text-muted-foreground">
											<Building2 className="h-3.5 w-3.5" />
											{worker.business.name}
										</span>
									)}
								</div>

								{expandedId === worker.id ? (
									<ChevronUp className="h-4 w-4 shrink-0" />
								) : (
									<ChevronDown className="h-4 w-4 shrink-0" />
								)}
							</div>

							{expandedId === worker.id && (
								<div className="px-4 pb-4 space-y-3">
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
										<div className="bg-muted/50 rounded-lg p-3">
											<p className="text-stat-label">Role</p>
											<p className="font-medium capitalize">
												{worker.role?.toLowerCase()}
											</p>
										</div>
										<div className="bg-muted/50 rounded-lg p-3">
											<p className="text-stat-label">Status</p>
											<p className="font-medium">
												{worker.isVerified ? "Verified" : "Unverified"}
											</p>
										</div>
										<div className="bg-muted/50 rounded-lg p-3">
											<p className="text-stat-label">Joined</p>
											<p className="font-medium">
												{new Date(worker.createdAt).toLocaleDateString()}
											</p>
										</div>
										<div className="bg-muted/50 rounded-lg p-3">
											<p className="text-stat-label">Last Updated</p>
											<p className="font-medium">
												{new Date(worker.updatedAt).toLocaleDateString()}
											</p>
										</div>
									</div>

									{worker.business && (
										<div className="bg-muted/50 rounded-lg p-3 text-sm">
											<p className="text-stat-label mb-2">Business</p>
											<div className="flex items-center gap-3">
												<Building2 className="h-5 w-5 text-primary" />
												<div>
													<p className="font-medium">{worker.business.name}</p>
													<p className="text-xs text-muted-foreground capitalize">
														{worker.business.businessType?.toLowerCase()}{" "}
														&middot;{" "}
														<span
															className={
																worker.business.kycStatus === "VERIFIED"
																	? "text-success"
																	: worker.business.kycStatus === "REJECTED"
																		? "text-destructive"
																		: "text-warning"
															}
														>
															KYC: {worker.business.kycStatus}
														</span>
													</p>
												</div>
											</div>
										</div>
									)}

									{worker.kyc && (
										<div className="bg-muted/50 rounded-lg p-3 text-sm">
											<p className="text-stat-label mb-1">KYC Document</p>
											<div className="flex items-center gap-2">
												<span
													className={`px-2 py-0.5 text-xs rounded-full ${
														worker.kyc.status === "VERIFIED"
															? "bg-success/10 text-success"
															: worker.kyc.status === "REJECTED"
																? "bg-destructive/10 text-destructive"
																: "bg-warning/10 text-warning"
													}`}
												>
													{worker.kyc.status}
												</span>
												{worker.kyc.submittedAt && (
													<span className="text-xs text-muted-foreground">
														Submitted:{" "}
														{new Date(
															worker.kyc.submittedAt,
														).toLocaleDateString()}
													</span>
												)}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
