import Product from "../models/Product.js";

// list with optional category filter & pagination
export const listProducts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const q = category ? { normalized_top_category: category } : {};
    const products = await Product.find(q).skip((page-1)*limit).limit(Number(limit));
    res.json({ products });
  } catch (err){ next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const p = await Product.findOne({ product_id: req.params.id });
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err){ next(err); }
};
