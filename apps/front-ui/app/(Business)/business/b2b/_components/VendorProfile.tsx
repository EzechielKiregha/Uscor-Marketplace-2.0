"use client";

import { useQuery } from "@apollo/client";
import {
    CheckCircle,
    Handshake,
    MapPin,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { GET_B2B_VENDORS } from "@/graphql/b2b.gql";

export default function VendorProfile() {
	const [businessTypeFilter, setBusinessTypeFilter] = useState("");

	const { data, loading } = useQuery(GET_B2B_VENDORS, {
		variables: {
			page: 1,
			limit: 50,
			businessType: businessTypeFilter || undefined,
		},
	});

	const vendors = data?.b2bVendors?.items || [];

	if (loading) return <TableSkeleton />;

	return (
		<div className="space-y-6">
			{/* Header + Filter */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-section-title flex items-center gap-2">
						<Handshake className="h-5 w-5 text-primary" />
						B2B Vendor Directory
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{vendors.length} verified vendors available for wholesale purchasing
					</p>
				</div>
				<select
					value={businessTypeFilter}
					onChange={(e) => setBusinessTypeFilter(e.target.value)}
					className="p-2 border border-border rounded-md bg-background text-sm"
				>
					<option value="">All Types</option>
					<option value="ELECTRONICS">Electronics</option>
					<option value="HARDWARE">Hardware</option>
					<option value="GROCERY">Grocery</option>
					<option value="BOOKSTORE">Bookstore</option>
					<option value="PHARMACY">Pharmacy</option>
					<option value="FASHION">Fashion</option>
					<option value="RESTAURANT">Restaurant</option>
					<option value="COSMETICS">Cosmetics</option>
				</select>
			</div>

			{/* Vendor grid */}
			{vendors.length === 0 ? (
				<EmptyState
					icon={emptyStateIcons.users}
					title="No B2B vendors found"
					description="No verified vendors match your criteria"
					compact
				/>
			) : (
				<MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{vendors.map((vendor: any) => (
						<MotionStaggerItem key={vendor.id}>
							<div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
								<div className="p-4 space-y-3">
									<div className="flex items-center gap-3">
										{vendor.avatar ? (
											<img
												src={vendor.avatar}
												alt=""
												className="w-12 h-12 rounded-full object-cover"
											/>
										) : (
											<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
												{vendor.name?.charAt(0)}
											</div>
										)}
										<div className="min-w-0">
											<p className="font-medium flex items-center gap-1.5 truncate">
												{vendor.name}
												<ShieldCheck className="h-4 w-4 text-success shrink-0" />
											</p>
											<p className="text-xs text-muted-foreground capitalize">
												{vendor.businessType?.toLowerCase()}
											</p>
										</div>
									</div>

									{/* Badges */}
									<div className="flex flex-wrap gap-1.5">
										<span className="px-2 py-0.5 text-xs rounded-full bg-success/10 text-success border border-success/20 flex items-center gap-1">
											<CheckCircle className="h-3 w-3" /> Verified Vendor
										</span>
										<span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
											<Handshake className="h-3 w-3" /> B2B Enabled
										</span>
									</div>

									{vendor.description && (
										<p className="text-sm text-muted-foreground line-clamp-2">
											{vendor.description}
										</p>
									)}

									{vendor.address && (
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<MapPin className="h-3 w-3" /> {vendor.address}
										</p>
									)}

									{/* Stats */}
									<div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
										<div className="text-center">
											<p className="text-xs text-muted-foreground">Products</p>
											<p className="font-bold text-sm">{vendor._count?.products || 0}</p>
										</div>
										<div className="text-center">
											<p className="text-xs text-muted-foreground">Stores</p>
											<p className="font-bold text-sm">{vendor._count?.stores || 0}</p>
										</div>
										<div className="text-center">
											<p className="text-xs text-muted-foreground">Sold</p>
											<p className="font-bold text-sm">{vendor.totalProductsSold || 0}</p>
										</div>
									</div>
								</div>
							</div>
						</MotionStaggerItem>
					))}
				</MotionStagger>
			)}
		</div>
	);
}
