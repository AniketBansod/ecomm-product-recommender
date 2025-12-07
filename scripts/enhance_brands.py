import pandas as pd
import re

CSV_IN = "data/products_curated_v2.csv"
CSV_OUT = "data/products_curated_v3_with_brands.csv"

# Known brand dictionary
BRANDS = {
    "Clothing": ["Puma", "Nike", "Adidas", "Levi's", "Roadster", "Wrangler", "Allen Solly", "Peter England"],
    "Footwear": ["Bata", "Sparx", "Campus", "Puma", "Adidas"],
    "Mobiles & Accessories": ["Samsung", "Apple", "MI", "Xiaomi", "Vivo", "Oppo", "OnePlus", "Realme"],
    "Computers": ["Dell", "HP", "Lenovo", "Asus", "Acer", "Apple"],
    "Beauty and Personal Care": ["Lakme", "Maybelline", "Mamaearth", "Loreal", "Nivea", "Himalaya", "Dove"],
    "Watches": ["Fossil", "Titan", "Casio", "Sonata", "Timex"],
    "Bags, Wallets & Belts": ["Wildcraft", "Skybags", "Safari", "American Tourister"],
    "Kitchen & Dining": ["Prestige", "Pigeon", "Milton", "Hawkins", "Cello"]
}

def extract_brand_from_title(title):
    if not isinstance(title, str):
        return ""
    
    # Pattern 1: First capitalized token or two tokens
    m = re.match(r"^([A-Za-z][A-Za-z0-9'&]+)", title)
    if m:
        return m.group(1)

    # Pattern 2: "by BRAND"
    m2 = re.search(r"by\s+([A-Za-z][A-Za-z0-9'&]+)", title, re.I)
    if m2:
        return m2.group(1)
    
    return ""

def match_known_brand(title, description, category):
    text = (str(title) + " " + str(description)).lower()

    for brand in BRANDS.get(category, []):
        if brand.lower() in text:
            return brand
    
    return ""

def enhance_brands():
    df = pd.read_csv(CSV_IN)
    
    enhanced = []
    for _, row in df.iterrows():
        brand = row.get("brand") if isinstance(row.get("brand"), str) and row.get("brand").strip() else ""

        if not brand:
            brand = extract_brand_from_title(row["title"])
        
        if not brand:
            brand = match_known_brand(row["title"], row["description"], row["normalized_top_category"])
        
        row["brand"] = brand
        enhanced.append(row)

    new_df = pd.DataFrame(enhanced)
    new_df.to_csv(CSV_OUT, index=False)
    print("Enhanced dataset saved to:", CSV_OUT)
    print("Missing brands reduced to:", new_df["brand"].isna().sum())

if __name__ == "__main__":
    enhance_brands()
