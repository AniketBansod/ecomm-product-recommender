import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/Product.js";

// Resolve paths relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendDir, "..");

// Load env from backend/.env explicitly
dotenv.config({ path: path.join(backendDir, ".env") });

const csvPath = path.join(
  repoRoot,
  "data",
  "products_curated_v3_with_brands.csv"
);

console.log("CSV Path:", csvPath);
console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    return seedProducts();
  })
  .then(() => mongoose.disconnect())
  .then(() => {
    console.log("Done. Disconnected from MongoDB.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    mongoose.disconnect().finally(() => process.exit(1));
  });

async function seedProducts() {
  await Product.deleteMany({});
  console.log("Old product data cleared.");

  const products = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .on("error", (err) => {
        console.error("Failed to read CSV:", err);
        reject(err);
      })
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
        try {
          await Product.insertMany(products, { ordered: false });
          console.log("Products inserted successfully!");
          resolve();
        } catch (e) {
          reject(e);
        }
      });
  });
}
