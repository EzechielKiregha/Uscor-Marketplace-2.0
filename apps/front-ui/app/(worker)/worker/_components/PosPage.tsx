// app/worker/pos/page.tsx (Updated)
"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
	AlertTriangle,
	Camera,
	Clock,
	CreditCard,
	Loader2,
	Minus,
	Package,
	Phone,
	Plus,
	Search,
	ShoppingCart,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ADD_SALE_PRODUCT,
	COMPLETE_SALE,
	GET_WORKER_CURRENT_SALE,
	GET_WORKER_INVENTORY,
	ON_INVENTORY_UPDATED,
	ON_SALE_CREATED,
	PROCESS_MOBILE_MONEY_PAYMENT,
	REMOVE_SALE_PRODUCT,
} from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useMe } from "@/lib/useMe";

interface PosPageProps {
	selectedStoreId: string | null;
}

export default function PosPage({ selectedStoreId }: PosPageProps) {
	const { user } = useMe();
	const {
		isOnline,
		saveLocalSale,
		getLocalSales,
		saveOfflineOperation,
		getPendingOperations,
		handleSync,
	} = useIndexedDB();

	const [currentSale, setCurrentSale] = useState<any>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProduct, setSelectedProduct] = useState<any>(null);
	const [quantity, setQuantity] = useState(1);
	const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
	const [isCompleting, setIsCompleting] = useState(false);
	const [_offlineQueue, _setOfflineQueue] = useState<any[]>([]);
	const { showToast } = useToast();

	const {
		data: currentSaleData,
		loading: currentSaleLoading,
		refetch: refetchCurrentSale,
	} = useQuery(GET_WORKER_CURRENT_SALE, {
		variables: {
			workerId: user?.id,
			storeId: selectedStoreId || "current-store-id", // In real app, this would be selected
		},
		skip: !user?.id,
	});

	const {
		data: inventoryData,
		loading: inventoryLoading,
		refetch: refetchInventory,
	} = useQuery(GET_WORKER_INVENTORY, {
		variables: {
			storeId: selectedStoreId || "current-store-id", // In real app, this would be selected
		},
		skip: !user?.id,
	});

	const [addSaleProduct] = useMutation(ADD_SALE_PRODUCT);
	const [removeSaleProduct] = useMutation(REMOVE_SALE_PRODUCT);
	const [completeSale] = useMutation(COMPLETE_SALE);
	const [processMobileMoney] = useMutation(PROCESS_MOBILE_MONEY_PAYMENT);

	// Handle real-time updates
	useSubscription(ON_SALE_CREATED, {
		variables: { storeId: "current-store-id" },
		onData: ({ data }) => {
			if (data.data.sale.id === currentSale?.id) {
				setCurrentSale(data.data.sale);
			} else {
				refetchCurrentSale();
			}
		},
	});

	useSubscription(ON_INVENTORY_UPDATED, {
		variables: { storeId: selectedStoreId || "current-store-id" },
		onData: ({ data }) => {
			refetchInventory();
		},
	});

	// Auto-sync when coming online
	useEffect(() => {
		if (isOnline) {
			handleSync();
		}
	}, [isOnline, handleSync]);

	const handleAddProduct = async (product: any, quantity: number = 1) => {
		if (!currentSale) {
			// Create new sale if none exists
			const newSale = {
				id: `temp_${Date.now()}`,
				storeId: "current-store-id",
				workerId: user?.id,
				totalAmount: 0,
				status: "OPEN",
				saleProducts: [],
			};
			setCurrentSale(newSale);
		}

		if (!isOnline) {
			// Add to local storage for offline processing
			const newSaleProduct = {
				id: `temp_${Date.now()}`,
				productId: product.id,
				product: product,
				quantity: quantity,
				price: product.price,
				modifiers: null,
			};

			const updatedSale = {
				...currentSale,
				saleProducts: [...(currentSale?.saleProducts || []), newSaleProduct],
				totalAmount: (currentSale?.totalAmount || 0) + product.price * quantity,
			};

			setCurrentSale(updatedSale);
			await saveLocalSale(updatedSale);
			await saveOfflineOperation({
				type: "ADD_PRODUCT",
				saleId: currentSale?.id || `temp_${Date.now()}`,
				productId: product.id,
				quantity: quantity,
			});

			showToast(
				"info",
				"Offline Mode",
				"Product added to local sale. Will sync when online.",
			);
		} else {
			try {
				await addSaleProduct({
					variables: {
						input: {
							saleId: currentSale.id,
							productId: product.id,
							quantity: quantity,
							price: product.price,
						},
					},
				});
				refetchCurrentSale();
				refetchInventory();
			} catch (error: any) {
				showToast("error", "Error", error.message || "Failed to add product");
			}
		}

		setSelectedProduct(null);
		setQuantity(1);
	};

	const handleRemoveProduct = async (productId: string) => {
		if (!isOnline) {
			// Handle offline removal
			const updatedSale = {
				...currentSale,
				saleProducts: currentSale.saleProducts.filter(
					(sp: any) => sp.productId !== productId,
				),
				totalAmount: currentSale.saleProducts
					.filter((sp: any) => sp.productId !== productId)
					.reduce((sum: number, sp: any) => sum + sp.price * sp.quantity, 0),
			};

			setCurrentSale(updatedSale);
			await saveLocalSale(updatedSale);
			await saveOfflineOperation({
				type: "REMOVE_PRODUCT",
				saleId: currentSale.id,
				productId: productId,
			});

			showToast(
				"info",
				"Offline Mode",
				"Product removed from local sale. Will sync when online.",
			);
		} else {
			try {
				await removeSaleProduct({
					variables: { id: productId },
				});
				refetchCurrentSale();
				refetchInventory();
			} catch (error: any) {
				showToast(
					"error",
					"Error",
					error.message || "Failed to remove product",
				);
			}
		}
	};

	const handleCompleteSale = async () => {
		if (!paymentMethod || !currentSale) return;

		setIsCompleting(true);

		if (!isOnline) {
			// Save to local storage for later sync
			const completedSale = {
				...currentSale,
				status: "COMPLETED",
				paymentMethod,
				completedAt: new Date().toISOString(),
			};

			await saveLocalSale(completedSale);
			await saveOfflineOperation({
				type: "COMPLETE_SALE",
				saleId: currentSale.id,
				paymentMethod: paymentMethod,
			});

			showToast(
				"info",
				"Offline Mode",
				"Sale completed offline. Will sync when online.",
			);
			setCurrentSale(null);
			setPaymentMethod(null);
		} else {
			try {
				await completeSale({
					variables: {
						id: currentSale.id,
						paymentMethod,
					},
				});

				showToast(
					"success",
					"Sale Completed",
					"Payment processed successfully",
				);
				setCurrentSale(null);
				setPaymentMethod(null);
				refetchCurrentSale();
			} catch (error: any) {
				showToast("error", "Error", error.message || "Failed to complete sale");
			}
		}

		setIsCompleting(false);
	};

	const handleMobileMoneyPayment = async () => {
		if (!currentSale) return;

		try {
			const { data } = await processMobileMoney({
				variables: {
					input: {
						amount: currentSale.totalAmount,
						provider: "MTN_MOMO", // This would be configurable
						phoneNumber: "250788123456", // This would come from client
					},
				},
			});

			// Show USSD code to user
			showToast(
				"info",
				"Payment Instruction",
				`Dial: ${data.processMobileMoneyPayment.ussdCode}`,
			);
		} catch (error: any) {
			showToast(
				"error",
				"Payment Error",
				error.message || "Failed to initiate mobile payment",
			);
		}
	};

	const calculateTotal = () => {
		if (!currentSale?.saleProducts) return 0;
		return currentSale.saleProducts.reduce(
			(sum: number, item: any) => sum + item.price * item.quantity,
			0,
		);
	};

	const filteredInventory =
		inventoryData?.workerInventory?.items?.filter(
			(item: any) =>
				item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.product.description
					?.toLowerCase()
					.includes(searchQuery.toLowerCase()),
		) || [];

	if (currentSaleLoading) return <Loader loading={true} />;

	return (
		<div className="space-y-6">
			{/* Offline Mode Indicator */}
			{!isOnline && (
				<div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-warning" />
					<div>
						<p className="font-medium">Offline Mode</p>
						<p className="text-sm text-muted-foreground">
							Sales will sync when connection is restored. Currently saving to
							local storage.
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Product Search */}
				<div className="lg:col-span-2">
					<div className="bg-card border border-border rounded-lg overflow-hidden">
						{/* Search Bar */}
						<div className="p-4 bg-muted border-b border-border">
							<div className="relative">
								<Input
									type="text"
									placeholder="Search products by name, barcode, or scan..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 pr-12"
								/>
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Button
									variant="outline"
									size="icon"
									className="absolute right-2 top-1/2 -translate-y-1/2"
								>
									<Camera className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Product Grid */}
						<div className="p-4">
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-100 overflow-y-auto">
								{filteredInventory.map((item: any) => (
									<div
										key={item.id}
										className="border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => {
											setSelectedProduct(item.product);
											setQuantity(1);
										}}
									>
										<div className="relative pb-[100%]">
											{item.product.imageUrl ? (
												<img
													src={item.product.imageUrl}
													alt={item.product.title}
													className="absolute top-0 left-0 w-full h-full object-cover rounded"
												/>
											) : (
												<div className="absolute top-0 left-0 w-full h-full bg-muted rounded flex items-center justify-center">
													<Package className="h-6 w-6 text-muted-foreground" />
												</div>
											)}
										</div>

										<div className="mt-2">
											<h3 className="font-medium text-sm truncate">
												{item.product.title}
											</h3>
											<p className="text-sm font-bold text-primary">
												${item.product.price.toFixed(2)}
											</p>
											<div className="flex justify-between items-center mt-1">
												<span className="text-xs text-muted-foreground">
													{item.quantity} in stock
												</span>
												{item.quantity < item.minQuantity && (
													<span className="text-xs bg-warning/10 text-warning px-1 rounded-full">
														Low
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Current Sale */}
				<div className="space-y-6">
					{/* Current Sale Summary */}
					<div className="bg-card border border-border rounded-lg overflow-hidden">
						<div className="p-4 bg-muted border-b border-border">
							<div className="flex justify-between items-center">
								<h2 className="font-semibold">Current Sale</h2>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">
										{new Date().toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							</div>
						</div>

						<div className="p-4">
							{currentSale?.saleProducts &&
							currentSale.saleProducts.length > 0 ? (
								<div className="space-y-3">
									{currentSale.saleProducts.map((item: any) => (
										<div
											key={item.id}
											className="flex items-center justify-between p-2 border border-border rounded-lg"
										>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium truncate">
													{item.product.title}
												</h4>
												<p className="text-sm text-muted-foreground">
													${item.price.toFixed(2)} x {item.quantity}
												</p>
											</div>

											<div className="flex items-center gap-2">
												<span className="font-bold">
													${(item.price * item.quantity).toFixed(2)}
												</span>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveProduct(item.id)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}

									<div className="pt-3 border-t border-border mt-3">
										<div className="flex justify-between items-center mb-1">
											<span className="font-medium">Subtotal:</span>
											<span className="font-bold">
												${calculateTotal().toFixed(2)}
											</span>
										</div>

										<div className="flex justify-between items-center mb-1">
											<span className="font-medium">Discount:</span>
											<span className="font-bold">$0.00</span>
										</div>

										<div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t border-border">
											<span>Total:</span>
											<span>${calculateTotal().toFixed(2)}</span>
										</div>
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<ShoppingCart className="h-12 w-12 mx-auto mb-3" />
									<p>No items in cart</p>
									<p className="text-sm mt-1">
										Search and select products to add
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Payment Methods */}
					<div className="bg-card border border-border rounded-lg overflow-hidden">
						<div className="p-4 bg-muted border-b border-border">
							<h2 className="font-semibold">Payment Method</h2>
						</div>

						<div className="p-4 space-y-3">
							<Button
								variant={paymentMethod === "CASH" ? "default" : "outline"}
								className="w-full justify-start"
								onClick={() => setPaymentMethod("CASH")}
							>
								<CreditCard className="h-4 w-4 mr-2" />
								Cash
							</Button>

							<Button
								variant={paymentMethod === "MTN_MOMO" ? "default" : "outline"}
								className="w-full justify-start"
								onClick={handleMobileMoneyPayment}
							>
								<Phone className="h-4 w-4 mr-2" />
								MTN Mobile Money
							</Button>

							<Button
								variant={
									paymentMethod === "AIRTEL_MONEY" ? "default" : "outline"
								}
								className="w-full justify-start"
								onClick={handleMobileMoneyPayment}
							>
								<Phone className="h-4 w-4 mr-2" />
								Airtel Money
							</Button>

							<Button
								variant={paymentMethod === "CARD" ? "default" : "outline"}
								className="w-full justify-start"
								onClick={() => setPaymentMethod("CARD")}
							>
								<CreditCard className="h-4 w-4 mr-2" />
								Card
							</Button>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-3">
						<Button
							className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-lg"
							disabled={
								!paymentMethod ||
								!currentSale?.saleProducts ||
								currentSale.saleProducts.length === 0
							}
							onClick={handleCompleteSale}
						>
							{isCompleting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>Complete Sale • ${calculateTotal().toFixed(2)}</>
							)}
						</Button>

						<Button
							variant="outline"
							className="w-full"
							onClick={() => {
								setCurrentSale(null);
								setPaymentMethod(null);
							}}
						>
							Clear Sale
						</Button>
					</div>
				</div>
			</div>

			{/* Product Selection Modal */}
			{selectedProduct && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-card border border-border rounded-lg w-full max-w-md">
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h2 className="text-xl font-bold">{selectedProduct.title}</h2>
									<p className="text-primary font-bold text-lg">
										${selectedProduct.price.toFixed(2)}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setSelectedProduct(null)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="flex items-center gap-3 mb-6">
								{selectedProduct.imageUrl ? (
									<img
										src={selectedProduct.imageUrl}
										alt={selectedProduct.title}
										className="w-16 h-16 object-cover rounded"
									/>
								) : (
									<div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
										<Package className="h-8 w-8 text-muted-foreground" />
									</div>
								)}

								<div>
									<p className="text-sm text-muted-foreground">In Stock</p>
									<p className="font-medium">
										{selectedProduct.stock} units available
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between mb-6">
								<label className="font-medium">Quantity</label>
								<div className="flex items-center border border-border rounded-md">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-r-none"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<Input
										type="number"
										value={quantity}
										onChange={(e) =>
											setQuantity(
												Math.max(1, parseInt(e.target.value, 10) || 1),
											)
										}
										className="w-16 h-8 text-center border-0 focus:outline-none focus:ring-0 p-0"
									/>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-l-none"
										onClick={() => setQuantity(quantity + 1)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-border">
								<Button
									variant="outline"
									onClick={() => setSelectedProduct(null)}
								>
									Cancel
								</Button>
								<Button
									onClick={() => handleAddProduct(selectedProduct, quantity)}
								>
									Add to Sale
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
