"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Building2,
	Check,
	ChevronDown,
	ChevronUp,
	Clock,
	CreditCard,
	MessageSquare,
	Package,
	Send,
	ShoppingCart,
	Truck,
	X,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import BusinessPaymentCodes from "@/components/BusinessPaymentCodes";
import ChatModal from "@/components/chat/ChatModal";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
	GET_B2B_ORDERS,
	PAY_B2B_ORDER,
	SUBMIT_B2B_ORDER,
	UPDATE_B2B_ORDER_STATUS,
} from "@/graphql/b2b.gql";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
	DRAFT: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock },
	SUBMITTED: { label: "Submitted", color: "bg-blue-500/10 text-blue-500", icon: Send },
	UNDER_REVIEW: { label: "Under Review", color: "bg-warning/10 text-warning", icon: Clock },
	APPROVED: { label: "Approved", color: "bg-success/10 text-success", icon: Check },
	REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
	PROCESSING: { label: "Processing", color: "bg-primary/10 text-primary", icon: Package },
	SHIPPED: { label: "Shipped", color: "bg-cyan-500/10 text-cyan-500", icon: Truck },
	DELIVERED: { label: "Delivered", color: "bg-success/10 text-success", icon: Check },
	CANCELLED: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: X },
};

interface Props {
	businessId: string;
}

export default function PurchaseRequests({ businessId }: Props) {
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [chatModalOpen, setChatModalOpen] = useState(false);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const { showToast } = useToast();

	const { data, loading, refetch } = useQuery(GET_B2B_ORDERS, {
		variables: {
			role: roleFilter,
			status: statusFilter || undefined,
			page: 1,
			limit: 50,
		},
	});

	const [submitOrder] = useMutation(SUBMIT_B2B_ORDER);
	const [updateStatus] = useMutation(UPDATE_B2B_ORDER_STATUS);

	const orders = data?.b2bOrders?.items || [];

	const handleSubmit = async (orderId: string) => {
		try {
			await submitOrder({ variables: { orderId } });
			showToast("success", "Submitted", "Order submitted to seller");
			refetch();
		} catch (err: any) {
			showToast("error", "Error", err.message);
		}
	};

	const handleStatusUpdate = async (orderId: string, status: string, rejectionReason?: string) => {
		try {
			await updateStatus({
				variables: { input: { orderId, status, rejectionReason } },
			});
			showToast("success", "Updated", `Order ${status.toLowerCase()}`);
			refetch();
		} catch (err: any) {
			showToast("error", "Error", err.message);
		}
	};

	if (loading) return <TableSkeleton />;

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex flex-wrap gap-2">
				<div className="flex rounded-lg border border-border overflow-hidden">
					{[
						{ value: "all", label: "All", icon: ShoppingCart },
						{ value: "buyer", label: "Sent", icon: ArrowUpRight },
						{ value: "seller", label: "Received", icon: ArrowDownLeft },
					].map((tab) => (
						<button
							key={tab.value}
							onClick={() => setRoleFilter(tab.value)}
							className={`px-4 py-2 text-sm flex items-center gap-1.5 transition-colors ${
								roleFilter === tab.value
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted"
							}`}
						>
							<tab.icon className="h-3.5 w-3.5" />
							{tab.label}
						</button>
					))}
				</div>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="p-2 border border-border rounded-md bg-background text-sm"
				>
					<option value="">All Statuses</option>
					{Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
						<option key={key} value={key}>{label}</option>
					))}
				</select>
			</div>

			{/* Orders list */}
			{orders.length === 0 ? (
				<EmptyState
					icon={emptyStateIcons.orders}
					title="No B2B orders yet"
					description="Purchase orders between businesses will appear here"
					compact
				/>
			) : (
				<div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
					{orders.map((order: any) => {
						const isBuyer = order.buyerId === businessId;
						const counterparty = isBuyer ? order.seller : order.buyer;
						const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.DRAFT;
						const StatusIcon = statusCfg.icon;

						return (
							<div key={order.id} className="hover:bg-muted/30 transition-colors">
								<div
									className="flex items-center justify-between p-4 cursor-pointer"
									onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
											isBuyer ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
										}`}>
											{isBuyer ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
										</div>
										<div className="min-w-0">
											<p className="font-medium truncate flex items-center gap-2">
												{isBuyer ? "To" : "From"}: {counterparty?.name}
												<span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusCfg.color}`}>
													<StatusIcon className="h-3 w-3" />
													{statusCfg.label}
												</span>
											</p>
											<p className="text-xs text-muted-foreground">
												#{order.orderNumber?.slice(0, 8)} &middot;{" "}
												{new Date(order.createdAt).toLocaleDateString()} &middot;{" "}
												{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<span className="font-bold">${order.total?.toFixed(2)}</span>
										{expandedId === order.id ? (
											<ChevronUp className="h-4 w-4" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</div>
								</div>

								{expandedId === order.id && (
									<div className="px-4 pb-4 space-y-4">
										{/* Items table */}
										<div className="bg-muted/50 rounded-lg overflow-hidden">
											<table className="w-full text-sm">
												<thead>
													<tr className="border-b border-border">
														<th className="text-left p-2 text-muted-foreground font-medium">Product</th>
														<th className="text-right p-2 text-muted-foreground font-medium">Qty</th>
														<th className="text-right p-2 text-muted-foreground font-medium">Unit Price</th>
														<th className="text-right p-2 text-muted-foreground font-medium">Total</th>
													</tr>
												</thead>
												<tbody>
													{order.items?.map((item: any) => (
														<tr key={item.id} className="border-b border-border/50">
															<td className="p-2">{item.product?.title || item.productId}</td>
															<td className="p-2 text-right">{item.quantity}</td>
															<td className="p-2 text-right">${item.unitPrice?.toFixed(2)}</td>
															<td className="p-2 text-right font-medium">${item.totalPrice?.toFixed(2)}</td>
														</tr>
													))}
												</tbody>
												<tfoot>
													<tr>
														<td colSpan={3} className="p-2 text-right font-medium">Total</td>
														<td className="p-2 text-right font-bold">${order.total?.toFixed(2)}</td>
													</tr>
												</tfoot>
											</table>
										</div>

										{/* Order details */}
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
											<div className="bg-muted/50 rounded-lg p-3">
												<p className="text-stat-label">Payment Terms</p>
												<p className="font-medium">{order.paymentTerms?.replace("_", " ")}</p>
											</div>
											<div className="bg-muted/50 rounded-lg p-3">
												<p className="text-stat-label">Created</p>
												<p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
											</div>
											{order.submittedAt && (
												<div className="bg-muted/50 rounded-lg p-3">
													<p className="text-stat-label">Submitted</p>
													<p className="font-medium">{new Date(order.submittedAt).toLocaleDateString()}</p>
												</div>
											)}
											{order.approvedAt && (
												<div className="bg-muted/50 rounded-lg p-3">
													<p className="text-stat-label">Approved</p>
													<p className="font-medium">{new Date(order.approvedAt).toLocaleDateString()}</p>
												</div>
											)}
										</div>

										{order.rejectionReason && (
											<div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm">
												<p className="text-destructive font-medium">Rejection Reason</p>
												<p className="text-muted-foreground">{order.rejectionReason}</p>
											</div>
										)}

										{order.notes && (
											<p className="text-sm text-muted-foreground">
												<span className="font-medium">Notes:</span> {order.notes}
											</p>
										)}

										{/* Payment Status */}
										{order.payment && (
											<div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
												<CreditCard className="h-4 w-4 text-muted-foreground" />
												<span className="text-muted-foreground">Payment:</span>
												<span className={`font-medium ${order.payment.status === "COMPLETED" ? "text-success" : "text-warning"}`}>
													{order.payment.status} — ${order.payment.amount?.toFixed(2)}
												</span>
											</div>
										)}

										{/* Seller Payment Codes (for buyer) */}
										{isBuyer && order.seller?.paymentConfig && ["APPROVED", "PROCESSING"].includes(order.status) && (
											<BusinessPaymentCodes
												businessName={order.seller.name}
												businessAvatar={order.seller.avatar}
												paymentConfig={order.seller.paymentConfig}
												amount={order.total}
												compact
											/>
										)}

										{/* Actions */}
										<div className="flex gap-2 pt-2 border-t border-border flex-wrap">
											{/* Chat button (always visible for active orders) */}
											{!["DRAFT", "CANCELLED", "DELIVERED"].includes(order.status) && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setActiveChatId(null);
														setChatModalOpen(true);
													}}
												>
													<MessageSquare className="h-4 w-4 mr-1" /> Chat
												</Button>
											)}

											{/* Buyer actions */}
											{isBuyer && order.status === "DRAFT" && (
												<Button size="sm" onClick={() => handleSubmit(order.id)}>
													<Send className="h-4 w-4 mr-1" /> Submit Order
												</Button>
											)}
											{isBuyer && ["DRAFT", "SUBMITTED"].includes(order.status) && (
												<Button
													variant="outline"
													size="sm"
													className="text-destructive"
													onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
												>
													<X className="h-4 w-4 mr-1" /> Cancel
												</Button>
											)}

											{/* Seller actions */}
											{!isBuyer && order.status === "SUBMITTED" && (
												<Button
													size="sm"
													onClick={() => handleStatusUpdate(order.id, "UNDER_REVIEW")}
												>
													<Clock className="h-4 w-4 mr-1" /> Review
												</Button>
											)}
											{!isBuyer && order.status === "UNDER_REVIEW" && (
												<>
													<Button
														size="sm"
														className="bg-success hover:bg-success/90 text-success-foreground"
														onClick={() => handleStatusUpdate(order.id, "APPROVED")}
													>
														<Check className="h-4 w-4 mr-1" /> Approve
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="text-destructive"
														onClick={() => {
															const reason = prompt("Rejection reason:");
															if (reason) handleStatusUpdate(order.id, "REJECTED", reason);
														}}
													>
														<XCircle className="h-4 w-4 mr-1" /> Reject
													</Button>
												</>
											)}
											{!isBuyer && order.status === "APPROVED" && (
												<Button
													size="sm"
													onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
												>
													<Package className="h-4 w-4 mr-1" /> Start Processing
												</Button>
											)}
											{!isBuyer && order.status === "PROCESSING" && (
												<Button
													size="sm"
													onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
												>
													<Truck className="h-4 w-4 mr-1" /> Mark Shipped
												</Button>
											)}
											{order.status === "SHIPPED" && (
												<Button
													size="sm"
													className="bg-success hover:bg-success/90 text-success-foreground"
													onClick={() => handleStatusUpdate(order.id, "DELIVERED")}
												>
													<Check className="h-4 w-4 mr-1" /> Confirm Delivery
												</Button>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Chat Modal */}
			<ChatModal
				isOpen={chatModalOpen}
				onClose={() => setChatModalOpen(false)}
				chatId={activeChatId || undefined}
			/>
		</div>
	);
}
