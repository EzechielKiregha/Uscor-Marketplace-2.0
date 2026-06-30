import { Injectable } from "@nestjs/common";
import { FreelanceServiceService } from "../freelance-service/freelance-service.service";
import { PrismaService } from "../prisma/prisma.service";

/** Standard product include for marketplace queries */
const PRODUCT_INCLUDE = {
	medias: { select: { url: true, type: true } },
	business: {
		select: {
			id: true,
			name: true,
			avatar: true,
			businessType: true,
			kycStatus: true,
			isVerified: true,
			isB2BEnabled: true,
		},
	},
	store: { select: { id: true, name: true } },
	category: { select: { id: true, name: true } },
} as const;

interface GetProductsArgs {
	search?: string;
	category?: string;
	businessType?: string;
	hasPromotion?: boolean;
	isFeatured?: boolean;
	minPrice?: number;
	maxPrice?: number;
	sort?: string;
	page?: number;
	limit?: number;
}

interface GetServicesArgs {
	search?: string;
	category?: string;
	businessType?: string;
	minPrice?: number;
	maxPrice?: number;
	sort?: string;
	page?: number;
	limit?: number;
}

@Injectable()
export class MarketplaceService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly freelanceServiceService: FreelanceServiceService,
	) {}

	// ─── Shared helpers ────────────────────────────────────────

	/**
	 * Fetch active promotions applicable to the given business IDs / category names,
	 * then map them onto each product. Eliminates the 3× copy-pasted promotion logic
	 * that previously lived in the resolver.
	 */
	async attachPromotions<T extends { businessId: string; category?: { name?: string } | null }>(
		products: T[],
	): Promise<(T & { promotions: any[] })[]> {
		if (products.length === 0) {
			return products.map((p) => ({ ...p, promotions: [] }));
		}

		const businessIds = Array.from(
			new Set(products.map((p) => p.businessId)),
		).filter(Boolean);
		const categoryNames = Array.from(
			new Set(products.map((p) => p.category?.name).filter(Boolean)),
		) as string[];

		const now = new Date();
		const promoWhereClauses: any[] = [];

		if (businessIds.length) {
			promoWhereClauses.push({
				applicableBusinesses: {
					some: { id: { in: businessIds } },
				},
			});
		}
		if (categoryNames.length) {
			promoWhereClauses.push({
				applicableCategories: { hasSome: categoryNames },
			});
		}

		let promotions: any[] = [];
		if (promoWhereClauses.length) {
			promotions = await this.prisma.promotion.findMany({
				where: {
					AND: [
						{ OR: promoWhereClauses },
						{ OR: [{ startDate: null }, { startDate: { lte: now } }] },
						{ OR: [{ endDate: null }, { endDate: { gte: now } }] },
					],
				},
				include: {
					applicableBusinesses: { select: { id: true } },
				},
			});
		}

		return products.map((p) => ({
			...p,
			promotions: promotions.filter((pr) => {
				const byBusiness = pr.applicableBusinesses?.some(
					(b: any) => b.id === p.businessId,
				);
				const byCategory = p.category?.name
					? pr.applicableCategories?.includes(p.category.name)
					: false;
				return byBusiness || byCategory;
			}),
		}));
	}

	// ─── Products ──────────────────────────────────────────────

	private buildProductWhere(args: GetProductsArgs) {
		const where: any = {};

		if (args.search) {
			where.OR = [
				{ title: { contains: args.search, mode: "insensitive" } },
				{ description: { contains: args.search, mode: "insensitive" } },
			];
		}
		if (args.category) {
			where.category = { OR: [{ id: args.category }, { name: args.category }] };
		}
		if (args.businessType) {
			where.business = { businessType: args.businessType };
		}
		if (args.isFeatured !== undefined) {
			where.featured = args.isFeatured;
		}
		if (args.minPrice !== undefined) {
			where.price = { ...where.price, gte: args.minPrice };
		}
		if (args.maxPrice !== undefined) {
			where.price = { ...where.price, lte: args.maxPrice };
		}

		return where;
	}

	private buildProductOrderBy(sort?: string) {
		return sort === "asc" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };
	}

	async getProducts(args: GetProductsArgs) {
		const {
			search, category, businessType, hasPromotion, isFeatured,
			minPrice, maxPrice, sort,
			page = 1, limit = 12,
		} = args;

		const where = this.buildProductWhere(args);
		const orderBy = this.buildProductOrderBy(sort);
		const skip = (page - 1) * limit;

		// Detect default (unfiltered) fetch
		const isDefaultFetch =
			!search &&
			!category &&
			!businessType &&
			hasPromotion !== true &&
			isFeatured !== true &&
			minPrice === undefined &&
			maxPrice === undefined &&
			(sort === undefined || sort === "relevance");

		// ── Default fetch: return ALL products (no pagination) ──
		if (isDefaultFetch) {
			const items = await this.prisma.product.findMany({
				where,
				include: PRODUCT_INCLUDE,
				orderBy,
			});
			const mapped = await this.attachPromotions(items as any[]);
			return { items: mapped, total: mapped.length, page: 1, limit: mapped.length };
		}

		// ── Promotion-only filter ──
		if (hasPromotion) {
			return this.getPromotedProducts(where, orderBy, skip, limit, page);
		}

		// ── Standard paginated query ──
		const [items, total] = await Promise.all([
			this.prisma.product.findMany({
				where,
				skip,
				take: limit,
				include: PRODUCT_INCLUDE,
				orderBy,
			}),
			this.prisma.product.count({ where }),
		]);

		const mapped = await this.attachPromotions(items as any[]);
		return { items: mapped, total, page, limit };
	}

	/** Fetch only products that have an active promotion. */
	private async getPromotedProducts(
		where: any,
		orderBy: any,
		skip: number,
		limit: number,
		page: number,
	) {
		// Fetch minimal data to evaluate promotion applicability
		const allMatches = await this.prisma.product.findMany({
			where,
			select: {
				id: true,
				businessId: true,
				category: { select: { name: true } },
			},
		});

		// Determine which of those products have an active promotion
		const withPromos = await this.attachPromotions(allMatches as any[]);
		const promotedIds = withPromos
			.filter((p) => p.promotions.length > 0)
			.map((p) => p.id);

		if (promotedIds.length === 0) {
			return { items: [], total: 0, page, limit };
		}

		const items = await this.prisma.product.findMany({
			where: { id: { in: promotedIds } },
			skip,
			take: limit,
			include: PRODUCT_INCLUDE,
			orderBy,
		});

		const mapped = await this.attachPromotions(items as any[]);
		return { items: mapped, total: promotedIds.length, page, limit };
	}

	// ─── Services ──────────────────────────────────────────────

	async getServices(args: GetServicesArgs) {
		const {
			search, category, businessType,
			minPrice, maxPrice,
			page = 1, limit = 12,
		} = args;

		if (businessType) {
			const skip = (page - 1) * limit;
			const where: any = {};

			if (category) where.category = { name: category };
			if (minPrice !== undefined) where.rate = { ...where.rate, gte: minPrice };
			if (maxPrice !== undefined) where.rate = { ...where.rate, lte: maxPrice };
			if (search) {
				where.OR = [
					{ title: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
				];
			}

			const [items, total] = await Promise.all([
				this.prisma.freelanceService.findMany({
					where: { ...where, business: { businessType } },
					skip,
					take: limit,
					include: {
						business: {
							select: {
								id: true,
								name: true,
								avatar: true,
								businessType: true,
								kycStatus: true,
							},
						},
						workerServiceAssignments: {
							include: {
								worker: {
									select: { id: true, fullName: true, avatar: true },
								},
							},
						},
					},
					orderBy: { createdAt: "desc" },
				}),
				this.prisma.freelanceService.count({
					where: { ...where, business: { businessType } },
				}),
			]);

			return { items, total, page, limit };
		}

		return this.freelanceServiceService.findAll({
			category,
			minRate: minPrice,
			maxRate: maxPrice,
			search,
			page,
			limit,
		});
	}

	// ─── Search ────────────────────────────────────────────────

	async searchMarketplace(query: string) {
		const [products, services] = await Promise.all([
			this.prisma.product.findMany({
				where: {
					OR: [
						{ title: { contains: query, mode: "insensitive" } },
						{ description: { contains: query, mode: "insensitive" } },
					],
				},
				include: PRODUCT_INCLUDE,
			}),
			this.freelanceServiceService.findAll({
				search: query,
				page: 1,
				limit: 50,
			}),
		]);

		const mappedProducts = await this.attachPromotions(products as any[]);

		return {
			products: mappedProducts,
			services: services.items,
		};
	}

	// ─── Lookups ───────────────────────────────────────────────

	async getBusinessTypes() {
		return this.prisma.businessType.findMany();
	}

	async getProductCategories() {
		return this.prisma.category.findMany();
	}

	// ─── New Phase 5 queries ───────────────────────────────────

	/** Top verified stores ordered by sales, with product count. */
	async getFeaturedStores(limit = 8) {
		const stores = await this.prisma.business.findMany({
			where: { isVerified: true, kycStatus: "VERIFIED" },
			orderBy: { totalProductsSold: "desc" },
			take: limit,
			select: {
				id: true,
				name: true,
				avatar: true,
				businessType: true,
				kycStatus: true,
				isVerified: true,
				totalSales: true,
				totalProductsSold: true,
				_count: { select: { products: true } },
			},
		});

		return {
			items: stores.map((s) => ({
				...s,
				kycStatus: s.kycStatus ?? undefined,
				productCount: s._count.products,
			})),
		};
	}

	/** Products filtered by the business's businessType. */
	async getProductsByType(businessType: string, limit = 8) {
		const items = await this.prisma.product.findMany({
			where: { business: { businessType } },
			take: limit,
			orderBy: { createdAt: "desc" },
			include: PRODUCT_INCLUDE,
		});

		const mapped = await this.attachPromotions(items as any[]);
		return { items: mapped, total: mapped.length };
	}
}
