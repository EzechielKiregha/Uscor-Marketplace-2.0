interface BusinessTypeProps {
  businessType: string;
}

export function GetBusinessType({ businessType }: { businessType: string }) {
  switch (businessType.toUpperCase()) {
    case "ARTISAN":
      return "Artisan & HandCrafted Goods";
    case "BOOKSTORE":
      return "Bookstore & Stationery";
    case "ELECTRONICS":
      return "Electronics & Gadgets";
    case "HARDWARE":
      return "Hardware & Tools";
    case "GROCERY":
      return "Grossery & Convenience";
    case "CAFE":
      return "Cafe & Coffee Shops";
    case "RESTAURANT":
      return "Restaurant & Dining";
    case "RETAIL":
      return "Retail & General Stores";
    case "BAR":
      return "Bar & Pub";
    case "CLOTHING":
      return "Clothing & Accessoires";
    default:
      return "";
  }
}
