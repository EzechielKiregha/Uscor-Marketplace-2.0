import { faker } from '@faker-js/faker';
import {
	Country,
	KycStatus,
	MediaType,
	PaymentMethod,
	PaymentStatus,
  PrismaClient,
} from '../src/generated/prisma/client';

const prisma = new PrismaClient();

// Pricing tiers copied from front-end pricing component
const pricingTiers = [
	{
		name: 'Basic',
		monthlyPrice: 9.99,
		yearlyPrice: 59.99,
		description: 'For shoppers and buyers',
		features: [
			'Up to 50 products',
			'Basic sales tracking',
			'1 store location',
			'Standard customer support',
			'Basic inventory management',
			'Mobile POS app access',
			'Basic reporting',
		],
	},
	{
		name: 'Pro',
		monthlyPrice: 19.99,
		yearlyPrice: 199.99,
		description: 'Full access to Intelligent POS & marketplace',
		features: [
			'Unlimited products',
			'Advanced sales analytics',
			'Up to 5 store locations',
			'Priority customer support',
			'Advanced inventory management',
			'Loyalty program',
			'Freelance services marketplace access',
			'Customizable POS interface',
			'Advanced reporting & exports',
			'Staff management & permissions',
		],
	},
	{
		name: 'Entreprise',
		monthlyPrice: 39.99,
		yearlyPrice: 249.99,
		description: 'For creators, consultants, and service pros',
		features: [
			'Unlimited products',
			'Custom analytics & reporting',
			'Unlimited store locations',
			'Dedicated account manager',
			'Advanced inventory & supply chain',
			'Custom loyalty program',
			'Full marketplace access',
			'API access & integrations',
			'Custom branding',
			'Priority technical support',
			'Custom feature development',
		],
	},
];

// Hardware items derived from HardwarePage.tsx
const hardwareItems = [
	{
		title: 'Epson TM-T88VI-i',
		model: 'TM-T88VI-i',
		type: 'printer',
		description: 'Offering fast print speeds and high reliability, with advanced features.',
		image: '/images/hardware/epson-tmt88vi.jpg',
	},
	{ title: 'Epson TM-m30', model: 'TM-m30', type: 'printer', description: 'Small footprint receipt printer', image: '/images/hardware/epson-tmm30.jpg' },
	{ title: 'XPrinter XP-Q800', model: 'XP-Q800', type: 'printer', description: 'Reliable quality at a low price', image: '/images/hardware/xprinter-xpq800.jpg' },
	{ title: 'Star TSP143IIIU', model: 'TSP143IIIU', type: 'printer', description: 'USB communication with iPad charging', image: '/images/hardware/star-tsp143iiiu.jpg' },
	{ title: 'Citizen CT-E651ET', model: 'CT-E651ET', type: 'printer', description: 'Stylish, high-performance 3-inch receipt printer', image: '/images/hardware/citizen-cte651et.jpg' },
	{ title: 'SPRT SP-POS890', model: 'SP-POS890', type: 'printer', description: 'High speed receipt printer with auto cutter', image: '/images/hardware/sprt-sp-pos890.jpg' },
	{ title: 'Star SM-T300i', model: 'SM-T300i', type: 'mobile-printer', description: 'Portable mobile Bluetooth thermal receipt printer', image: '/images/hardware/star-sm-t300i.jpg' },
	{ title: 'Seiko MP-B20', model: 'MP-B20', type: 'mobile-printer', description: 'Compact and ultra-lightweight mobile printer', image: '/images/hardware/seiko-mp-b20.jpg' },
	{ title: 'Zebra ZD410', model: 'ZD410', type: 'label-printer', description: 'Designed for the smallest of workspaces', image: '/images/hardware/zebra-zd410.jpg' },
	{ title: 'Motorola CS3070', model: 'CS3070', type: 'scanner', description: 'Tiny device for batch scanning', image: '/images/hardware/motorola-cs3070.jpg' },
	{ title: 'Datalogic QuickScan Lite QW2100', model: 'QW2100', type: 'scanner', description: 'Small, lightweight and ergonomic', image: '/images/hardware/datalogic-qw2100.jpg' },
	{ title: 'Zebex Z-3250', model: 'Z-3250', type: 'scanner', description: 'Compact scanner with wireless communication', image: '/images/hardware/zebex-z3250.jpg' },
	{ title: 'Volcora', model: 'Volcora-16', type: 'cash-drawer', description: '16" Drawer 5 Bill / 6 Coin Tray', image: '/images/hardware/volcora.jpg' },
	{ title: 'Sunmi', model: 'Sunmi', type: 'terminal', description: 'Uscor compatible terminal with built-in printer', image: '/images/hardware/sunmi.jpg' },
	{ title: 'BOXaPOS small printer stand', model: 'BOXaPOS-stand', type: 'stand', description: 'Spacing for a compact printer', image: '/images/hardware/boxapos-small-stand.jpg' },
	{ title: 'Kensington Adjustable Kickstand', model: 'Kensington-kickstand', type: 'stand', description: 'Makes typing and viewing easier', image: '/images/hardware/kensington-kickstand.jpg' },
	{ title: 'PayPal Zettle', model: 'Zettle', type: 'card-reader', description: 'PayPal Reader – Accept contactless, chip, and swipe payments', image: '/images/hardware/paypal-zettle.jpg' },
];

const countriesToSeed: Country[] = [Country.DRC, Country.KENYA, Country.UGANDA, Country.RWANDA];

const businessTypes = [
	{ name: 'Retail', description: 'Stores selling physical products' },
	{ name: 'Service', description: 'Service providers and professionals' },
	{ name: 'Food & Beverage', description: 'Restaurants, cafes and food trucks' },
	{ name: 'Artisan', description: 'Handmade goods and creators' },
	{ name: 'Wholesale', description: 'Bulk sellers and distributors' },
];

async function seedPricingPlans() {
	console.log('Seeding Pricing Plans...');
	for (const tier of pricingTiers) {
		// Upsert plan (we keep a single plan entry with monthly pricing in the PricingPlan model). We'll store monthly price as the "price" field and include a feature list in PricingFeature.
		const existing = await prisma.pricingPlan.findFirst({ where: { name: tier.name } });
		let plan;
		if (!existing) {
			plan = await prisma.pricingPlan.create({
				data: {
					name: tier.name,
					description: tier.description,
					price: tier.monthlyPrice,
				},
			});
			console.log(`Created plan ${plan.name}`);
		} else {
			plan = await prisma.pricingPlan.update({ where: { id: existing.id }, data: { description: tier.description, price: tier.monthlyPrice } });
			console.log(`Updated plan ${plan.name}`);
		}

		// Sync features: remove any existing features that are not in the current list, and upsert those that are.
		const existingFeatures = await prisma.pricingFeature.findMany({ where: { planId: plan.id } });
		const existingNames = existingFeatures.map((f) => f.name);

		// Create missing features
		for (const feat of tier.features) {
			if (!existingNames.includes(feat)) {
			await prisma.pricingFeature.create({ data: { name: feat, description: feat, planId: plan.id } });
				console.log(`  - Added feature: ${feat}`);
			}
		}

		// Remove stale features
		for (const f of existingFeatures) {
			if (!tier.features.includes(f.name)) {
			await prisma.pricingFeature.delete({ where: { id: f.id } });
				console.log(`  - Removed stale feature: ${f.name}`);
			}
		}
	}
}

async function seedHardwareRecommendations() {
	console.log('Seeding Hardware Recommendations...');

	for (const country of countriesToSeed) {
		for (const item of hardwareItems) {
			// Using businessType null for now; country-specific recommendations will be duplicated across countries
			const existing = await prisma.hardwareRecommendation.findFirst({ where: { model: item.model, country } });
			if (!existing) {
			await prisma.hardwareRecommendation.create({
					data: {
						type: item.type,
						model: item.model,
						description: item.description,
						localSupplier: faker.company.name(),
						priceRange: `${Math.floor(Math.random() * 200) + 50}-${Math.floor(Math.random() * 600) + 200}`,
						setupGuideUrl: item.image,
						businessType: 'Retail',
						country,
					},
				});
				console.log(`  - Added ${item.model} for ${country}`);
			} else {
				// Optionally update basic fields
			await prisma.hardwareRecommendation.update({ where: { id: existing.id }, data: { description: item.description, setupGuideUrl: item.image } });
			}
		}
	}
}

async function seedBusinessTypes() {
	console.log('Seeding Business Types...');
	for (const bt of businessTypes) {
		const existing = await prisma.businessType.findFirst({ where: { name: bt.name } });
		if (!existing) {
			await prisma.businessType.create({ data: { name: bt.name, description: bt.description } });
			console.log(`  - Created business type ${bt.name}`);
		}
	}
}

async function main() {
	console.log('Starting seed...');
	try {
		await seedPricingPlans();
		await seedHardwareRecommendations();
		await seedBusinessTypes();
		console.log('Seeding completed.');
	} catch (err) {
		console.error('Seeding error:', err);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

// Execute when run with `ts-node` or `node` (compiled)
if (require.main === module) {
	main();
}

export default main;
