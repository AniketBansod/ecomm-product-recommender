import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import path from "path";
import Product from "../src/models/Product.js";

dotenv.config();

const __dirname = path.resolve();
const csvPath = path.join(__dirname, "data", "products_curated_v3_with_brands.csv");

console.log("CSV Path:", csvPath);
console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedProducts();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

async function seedProducts() {
  try {
    await Product.deleteMany({});
    console.log("Old product data cleared.");

    const products = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        products.push({
          product_id: row.product_id,
          title: row.title,
          description: row.description,
          full_category_path: row.full_category_path,
          top_category: row.top_category,
          normalized_top_category: row.normalized_top_category,
          brand: row.brand || "Unknown",
          price: Number(row.price) || 0,
          image_url: row.image_url,
        });
      })
      .on("end", async () => {
        console.log(`Parsed ${products.length} products. Inserting...`);
        await Product.insertMany(products);
        console.log("Products inserted successfully!");
        process.exit(0);
      });
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}
