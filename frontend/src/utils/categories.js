// Centralized category metadata: aliases and image URLs

export const CATEGORY_ALIASES = {
  Beauty: "Beauty and Personal Care",
  beauty: "Beauty and Personal Care",
  Bags: "Bags, Wallets & Belts",
  bags: "Bags, Wallets & Belts",
  Kitchen: "Kitchen & Dining",
  kitchen: "Kitchen & Dining",
};

// Stable, externally hosted images (Unsplash Source provides reliable CDN links)
// These are category-themed images intended for non-commercial demo use.
// Prefer local public assets added by user.
// Place images in `frontend/public` named exactly as keys with extension .jpg or .png.
// Example: `/Clothing.jpg`, `/Footwear.jpg`, `/Mobiles & Accessories.jpg`, etc.
export const CATEGORY_IMAGE_URLS = {
  Clothing: "clothing.webp",
  Computers: "/computers.jpg",
  Beauty: "/beauty.jpg",
  Watches: "/watches.jpg",
  Bags: "/bags.jpg",
  Kitchen: "/kitchen.jpg",
};

export const CATEGORIES = [
  { key: "Clothing", icon: "👕", image: CATEGORY_IMAGE_URLS["Clothing"] },
  { key: "Footwear", icon: "👟", image: CATEGORY_IMAGE_URLS["Footwear"] },
  {
    key: "Mobiles & Accessories",
    icon: "📱",
    image: CATEGORY_IMAGE_URLS["Mobiles & Accessories"],
  },
  { key: "Computers", icon: "💻", image: CATEGORY_IMAGE_URLS["Computers"] },
  { key: "Beauty", icon: "💄", image: CATEGORY_IMAGE_URLS["Beauty"] },
  { key: "Watches", icon: "⌚", image: CATEGORY_IMAGE_URLS["Watches"] },
  { key: "Bags", icon: "👜", image: CATEGORY_IMAGE_URLS["Bags"] },
  { key: "Kitchen", icon: "🍳", image: CATEGORY_IMAGE_URLS["Kitchen"] },
];

export function toCanonicalCategory(name) {
  return CATEGORY_ALIASES[name] || name;
}
