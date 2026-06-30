import Decimal from "decimal.js";

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ─── Constants ──────────────────────────────────────────────────────────

/** 1 uTn = $10 USD */
export const TOKEN_TO_USD_RATE = new Decimal(10);

/** Platform commission on reposted products: 0.2% */
export const REPOST_COMMISSION_RATE = new Decimal("0.002");

/** Default platform commission on freelance orders: 10% */
export const FREELANCE_COMMISSION_RATE = new Decimal("0.1");

/** Default tax rate: 18% */
export const DEFAULT_TAX_RATE = new Decimal("0.18");

// ─── Token Conversion ───────────────────────────────────────────────────

/** Convert USD amount to token amount: amount / 10 */
export function usdToTokens(usdAmount: number): number {
	return new Decimal(usdAmount).div(TOKEN_TO_USD_RATE).toNumber();
}

/** Convert token amount to USD: tokens * 10 */
export function tokensToUsd(tokenAmount: number): number {
	return new Decimal(tokenAmount).mul(TOKEN_TO_USD_RATE).toNumber();
}

// ─── Financial Arithmetic ───────────────────────────────────────────────

/** Multiply two numbers with Decimal precision */
export function mulPrecise(a: number, b: number): number {
	return new Decimal(a).mul(new Decimal(b)).toNumber();
}

/** Divide two numbers with Decimal precision */
export function divPrecise(a: number, b: number): number {
	if (b === 0) throw new Error("Division by zero");
	return new Decimal(a).div(new Decimal(b)).toNumber();
}

/** Sum an array of numbers with Decimal precision */
export function sumPrecise(values: number[]): number {
	return values
		.reduce((acc, val) => acc.plus(new Decimal(val)), new Decimal(0))
		.toNumber();
}

/** Calculate commission: amount * rate */
export function calcCommission(amount: number, rate: number): number {
	return new Decimal(amount).mul(new Decimal(rate)).toNumber();
}

/** Calculate amount after commission deduction: amount * (1 - rate) */
export function afterCommission(amount: number, rate: number): number {
	return new Decimal(amount)
		.mul(new Decimal(1).minus(new Decimal(rate)))
		.toNumber();
}

/** Round to 2 decimal places for display */
export function roundCurrency(amount: number): number {
	return new Decimal(amount).toDecimalPlaces(2).toNumber();
}

/** Calculate tax on an amount */
export function calcTax(amount: number, rate: number = DEFAULT_TAX_RATE.toNumber()): number {
	return new Decimal(amount).mul(new Decimal(rate)).toDecimalPlaces(2).toNumber();
}

/** Line total: price * quantity with precision */
export function lineTotal(price: number, quantity: number): number {
	return new Decimal(price).mul(new Decimal(quantity)).toNumber();
}
