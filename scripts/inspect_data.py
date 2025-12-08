import pandas as pd

CSV_PATH = "data/products_curated_v3_with_brands.csv"

def main():
    print("🔍 Loading dataset...")
    df = pd.read_csv(CSV_PATH)

    print("\n===== DATASET SUMMARY =====")
    print("Total rows:", len(df))
    print("\nColumns:", list(df.columns))

    print("\n===== SAMPLE ROWS =====")
    print(df.head(5))

    print("\n===== CATEGORY DISTRIBUTION =====")
    print(df["normalized_top_category"].value_counts())

    print("\n===== Missing Values Check =====")
    print(df.isnull().sum())

    print("\n===== Price Stats =====")
    print(df["price"].describe())

    print("\nRun Completed ✅")

if __name__ == "__main__":
    main()
