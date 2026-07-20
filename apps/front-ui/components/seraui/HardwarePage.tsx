"use client";

import { useState } from "react";

// --- Hardware Data (from your scraped file) ---
type HardwareItem = {
	id: number;
	title: string;
	description: string;
	image: string;
	type:
		| "printer"
		| "mobile-printer"
		| "label-printer"
		| "scanner"
		| "cash-drawer"
		| "terminal"
		| "card-reader"
		| "stand";
	compatibility: ("android" | "ios" | "desktop" | "card-readers")[];
	connectivity: ("USB" | "Bluetooth" | "Ethernet" | "Wi-Fi")[];
};

const hardwareItems: HardwareItem[] = [
	{
		id: 1,
		title: "Epson TM-T88VI-i",
		description:
			"Offering fast print speeds and high reliability, with advanced features.",
		image: "/images/hardware/epson-tmt88vi.jpg",
		type: "printer",
		compatibility: ["android", "ios"],
		connectivity: ["Ethernet"],
	},
	{
		id: 2,
		title: "Epson TM-m30",
		description:
			"Available in both black and white, its very small footprint makes it ideal for customers with limited counter space.",
		image: "/images/hardware/epson-tmm30.jpg",
		type: "printer",
		compatibility: ["android", "ios"],
		connectivity: ["Ethernet", "Bluetooth", "USB"],
	},
	{
		id: 3,
		title: "XPrinter XP-Q800",
		description:
			"Provides reliable quality at a low price. With LAN interface and Epson ESC/POS commands compatibility.",
		image: "/images/hardware/xprinter-xpq800.jpg",
		type: "printer",
		compatibility: ["android"],
		connectivity: ["Ethernet"],
	},
	{
		id: 4,
		title: "Star TSP143IIIU",
		description:
			"Enables reliable USB communication and simultaneous charging with an iPad or iPhone.",
		image: "/images/hardware/star-tsp143iiiu.jpg",
		type: "printer",
		compatibility: ["ios"],
		connectivity: ["USB"],
	},
	{
		id: 5,
		title: "Citizen CT-E651ET",
		description:
			"Stylish, high-performance 3-inch receipt printer. A model that combines design and practicality.",
		image: "/images/hardware/citizen-cte651et.jpg",
		type: "printer",
		compatibility: ["android", "ios"],
		connectivity: ["Ethernet"],
	},
	{
		id: 6,
		title: "SPRT SP-POS890",
		description:
			"High speed receipt printer with auto cutter. 58mm and 80mm paper width support. Sound and light alarm.",
		image: "/images/hardware/sprt-sp-pos890.jpg",
		type: "printer",
		compatibility: ["android", "ios"],
		connectivity: ["Ethernet"],
	},
	{
		id: 7,
		title: "Star SM-T300i",
		description:
			"Portable mobile Bluetooth thermal receipt printer. It has reliable and quick print speed of 75mm per second.",
		image: "/images/hardware/star-sm-t300i.jpg",
		type: "mobile-printer",
		compatibility: ["ios"],
		connectivity: ["Bluetooth"],
	},
	{
		id: 8,
		title: "Seiko MP-B20",
		description:
			"Compact and ultra-lightweight 2” mobile printer has a rugged, drop-resistant design.",
		image: "/images/hardware/seiko-mp-b20.jpg",
		type: "mobile-printer",
		compatibility: ["android"],
		connectivity: ["Bluetooth"],
	},
	{
		id: 9,
		title: "Zebra ZD410",
		description:
			"Designed for the smallest of workspaces, easy to use, maximizing printer uptime.",
		image: "/images/hardware/zebra-zd410.jpg",
		type: "label-printer",
		compatibility: ["desktop"],
		connectivity: ["USB"],
	},
	{
		id: 10,
		title: "Motorola CS3070",
		description:
			"The tiny device fits in a pocket. Can be utilized in standalone mode for the batch scanning of bar codes.",
		image: "/images/hardware/motorola-cs3070.jpg",
		type: "scanner",
		compatibility: ["android"],
		connectivity: ["Bluetooth"],
	},
	{
		id: 11,
		title: "Datalogic QuickScan Lite QW2100",
		description:
			"Small, lightweight and its ergonomic design is comfortable to use during daily operations.",
		image: "/images/hardware/datalogic-qw2100.jpg",
		type: "scanner",
		compatibility: ["android"],
		connectivity: ["USB"],
	},
	{
		id: 12,
		title: "Zebex Z-3250",
		description:
			"The compact scanner offers a wide scanning range and wireless communication technology for easy handling of any applications.",
		image: "/images/hardware/zebex-z3250.jpg",
		type: "scanner",
		compatibility: ["android"],
		connectivity: ["Bluetooth"],
	},
	{
		id: 13,
		title: "Volcora",
		description:
			'16" Drawer 5 Bill / 6 Coin Tray, Auto-open, Removable Coin Compartment.',
		image: "/images/hardware/volcora.jpg",
		type: "cash-drawer",
		compatibility: ["android", "ios"],
		connectivity: [],
	},
	{
		id: 14,
		title: "Sunmi",
		description: "Uscor is compatible with built-in printers on Sunmi devices.",
		image: "/images/hardware/sunmi.jpg",
		type: "terminal",
		compatibility: ["android"],
		connectivity: ["Ethernet", "Bluetooth", "USB"],
	},
	{
		id: 15,
		title: "BOXaPOS small printer stand",
		description:
			"Spacing for a compact printer. At the rear, a payment holder or extra display can be put. Fits all tablets.",
		image: "/images/hardware/boxapos-small-stand.jpg",
		type: "stand",
		compatibility: ["android", "ios"],
		connectivity: [],
	},
	{
		id: 16,
		title: "Kensington Adjustable Kickstand",
		description:
			"Makes typing and viewing easier for customers. Provides 180 degree of adjustability.",
		image: "/images/hardware/kensington-kickstand.jpg",
		type: "stand",
		compatibility: ["ios"],
		connectivity: [],
	},
	{
		id: 17,
		title: "PayPal Zettle",
		description:
			"PayPal Reader – Accept contactless, chip, and swipe payments.",
		image: "/images/hardware/paypal-zettle.jpg",
		type: "card-reader",
		compatibility: ["ios", "android", "card-readers"],
		connectivity: ["Bluetooth"],
	},
];

// --- SVG Icons ---
const _FilterIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
	</svg>
);

const SearchIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.35-4.35" />
	</svg>
);

// --- Hardware Card ---
const HardwareCard = ({ item }: { item: HardwareItem }) => {
	return (
		<div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300 hover:-translate-y-1">
			<div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
				<img
					src={item.image}
					alt={item.title}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.src = `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(item.title)}`;
					}}
				/>
			</div>
			<div className="p-5">
				<h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
					{item.title}
				</h3>
				<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
					{item.description}
				</p>

				{/* Compatibility */}
				<div className="flex flex-wrap gap-2 mb-3">
					{item.compatibility.map((os) => (
						<span
							key={os}
							className={`
                text-xs px-2 py-1 rounded-full capitalize font-medium
                ${os === "android" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : ""}
                ${os === "ios" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                ${os === "desktop" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : ""}
                ${os === "card-readers" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : ""}
              `}
						>
							{os.replace("-readers", "")}
						</span>
					))}
				</div>

				{/* Connectivity */}
				<div className="flex flex-wrap gap-1.5">
					{item.connectivity.map((tech) => (
						<span
							key={tech}
							className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded font-medium"
						>
							{tech}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

// --- Main Export ---
export default function HardwarePage() {
	const [filter, setFilter] = useState<"all" | "android" | "ios">("all");
	const [search, setSearch] = useState("");

	const filteredItems = hardwareItems.filter((item) => {
		const matchesFilter = filter === "all" || item.compatibility.includes(filter);
		const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 right-1/4 w-[500px] h-[400px] rounded-full bg-orange-500/8 dark:bg-orange-500/5 blur-[100px]" />
					<div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-500/5 dark:bg-amber-500/3 blur-[80px]" />
				</div>

				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-800/50 mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
						Tested & Compatible
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
						Hardware Built for{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500">
							USCOR POS
						</span>
					</h1>

					<p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						From receipt printers to card readers — pair your Intelligent POS
						with best-in-class hardware, all tested for reliability.
					</p>
				</div>
			</section>

			{/* Content */}
			<div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
				{/* Filters */}
				<div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
					<div className="flex items-center border border-border focus-within:border-orange-300 dark:focus-within:border-orange-700 rounded-lg px-3 py-2.5 bg-card w-full sm:w-auto transition-colors">
						<SearchIcon />
						<input
							type="text"
							placeholder="Search hardware..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="ml-2 bg-transparent outline-none text-foreground placeholder-muted-foreground w-full text-sm"
						/>
					</div>

					<div className="flex rounded-lg overflow-hidden border border-border bg-card w-full sm:w-auto">
						{(["all", "android", "ios"] as const).map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
									filter === f
										? "bg-orange-600 text-white"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								}`}
							>
								{f === "all" ? "All Devices" : f}
							</button>
						))}
					</div>
				</div>

				{/* Hardware Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredItems.map((item) => (
						<HardwareCard key={item.id} item={item} />
					))}
				</div>

				{filteredItems.length === 0 && (
					<div className="text-center py-16">
						<p className="text-muted-foreground">No hardware matches your search.</p>
					</div>
				)}

				{/* CTA */}
				<div className="mt-20 text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-800/30">
					<h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
						Need help choosing the right setup?
					</h2>
					<p className="text-muted-foreground mb-8 max-w-lg mx-auto">
						Our team can recommend the perfect hardware combination for your business type and volume.
					</p>
					<button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-600/20 transition-all">
						Contact Sales
					</button>
				</div>
			</div>
		</div>
	);
}
