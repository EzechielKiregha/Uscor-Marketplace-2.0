"use client";

import { AlertTriangle, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: "withdraw" | "convert" | "recharge" | "redeem" | "release";
	amount: number;
	currentBalance: number;
	loading?: boolean;
}

const TYPE_CONFIG = {
	withdraw: {
		title: "Confirm Withdrawal",
		verb: "Withdraw",
		icon: "text-warning",
		description: "This will deduct funds from your available balance.",
	},
	convert: {
		title: "Confirm Token Conversion",
		verb: "Convert",
		icon: "text-primary",
		description: "This will convert your balance into USCOR tokens (uTn).",
	},
	recharge: {
		title: "Confirm Recharge",
		verb: "Recharge",
		icon: "text-success",
		description: "This will add funds to your account balance.",
	},
	redeem: {
		title: "Confirm Token Redemption",
		verb: "Redeem",
		icon: "text-success",
		description: "This will redeem tokens to your available balance.",
	},
	release: {
		title: "Confirm Token Release",
		verb: "Release",
		icon: "text-warning",
		description: "This will release held tokens to the other party.",
	},
};

export default function TransactionConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	type,
	amount,
	currentBalance,
	loading,
}: TransactionConfirmDialogProps) {
	if (!isOpen) return null;

	const config = TYPE_CONFIG[type];
	const isDebit = type === "withdraw" || type === "convert" || type === "release";
	const projectedBalance = isDebit
		? currentBalance - amount
		: currentBalance + amount;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-card border border-border rounded-xl w-full max-w-md mx-4 shadow-lg">
				{/* Header */}
				<div className="p-6 border-b border-border">
					<div className="flex items-center gap-3">
						<div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config.icon}`}>
							<Shield className="h-5 w-5" />
						</div>
						<div>
							<h3 className="font-bold text-lg">{config.title}</h3>
							<p className="text-sm text-muted-foreground">{config.description}</p>
						</div>
					</div>
				</div>

				{/* Balance Preview */}
				<div className="p-6 space-y-4">
					<div className="bg-muted/50 rounded-lg p-4 space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Current Balance</span>
							<span className="font-medium">
								{type === "redeem" || type === "release"
									? `${currentBalance} uTn`
									: `$${currentBalance.toFixed(2)}`}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">{config.verb} Amount</span>
							<span className={`font-medium ${isDebit ? "text-destructive" : "text-success"}`}>
								{isDebit ? "-" : "+"}
								{type === "redeem" || type === "release"
									? `${amount} uTn`
									: `$${amount.toFixed(2)}`}
							</span>
						</div>
						<div className="border-t border-border pt-2 flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Projected Balance</span>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									{type === "redeem" || type === "release"
										? `${currentBalance} uTn`
										: `$${currentBalance.toFixed(2)}`}
								</span>
								<ArrowRight className="h-3 w-3 text-muted-foreground" />
								<span className={`font-bold ${projectedBalance < 0 ? "text-destructive" : ""}`}>
									{type === "redeem" || type === "release"
										? `${projectedBalance} uTn`
										: `$${projectedBalance.toFixed(2)}`}
								</span>
							</div>
						</div>
					</div>

					{projectedBalance < 0 && (
						<div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
							<AlertTriangle className="h-4 w-4 shrink-0" />
							<span>Insufficient balance for this transaction.</span>
						</div>
					)}

					{isDebit && projectedBalance >= 0 && (
						<div className="flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
							<AlertTriangle className="h-4 w-4 shrink-0" />
							<span>This action cannot be undone. Please verify the amount.</span>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="p-6 pt-0 flex gap-3">
					<Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant={isDebit ? "destructive" : "default"}
						className="flex-1"
						onClick={onConfirm}
						disabled={loading || projectedBalance < 0}
					>
						{loading ? "Processing..." : `${config.verb} ${type === "redeem" || type === "release" ? `${amount} uTn` : `$${amount.toFixed(2)}`}`}
					</Button>
				</div>
			</div>
		</div>
	);
}
