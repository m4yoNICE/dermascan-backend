import * as skinCareService from "../services/skinCareProductsService.js";
import { uploadToImageKit } from "../../utils/imageKitUpload.js";
export const getAllProducts = async (req, res) => {
  try {
    const products = await skinCareService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await skinCareService.getProductById(Number(req.params.id));
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    let productImage = null;
    if (req.file) {
      productImage = await uploadToImageKit(
        req.file.buffer,
        `product-${Date.now()}.jpg`,
        "/products",
      );
    }
    const data = {
      ...req.body,
      productImage,
      dermaTested: req.body.dermaTested === "true",
    };
    const result = await skinCareService.createProduct(data);
    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await skinCareService.getProductById(Number(req.params.id));
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });

    let productImage = product.productImage; // keep existing if no new file
    if (req.file) {
      productImage = await uploadToImageKit(
        req.file.buffer,
        `product-${Date.now()}.jpg`,
        "/products",
      );
    }

    const data = {
      ...req.body,
      productImage,
      dermaTested: req.body.dermaTested === "true",
    };

    const result = await skinCareService.updateProduct(
      Number(req.params.id),
      data,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        data: result,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await skinCareService.getProductById(Number(req.params.id));
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found. " });
    }
    await skinCareService.deleteProduct(Number(req.params.id));
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getConditionCounts = async (req, res) => {
  try {
    const counts = await skinCareService.conditionCounts();
    res.status(200).json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleFetchConditionProducts = async (req, res) => {
  try {
      const conditionProducts = await skinCareService.fetchConditionProducts();
      return res.status(200).json({ success: true, message: "Condition products fetched successfully", data: conditionProducts });
  } catch (err) {
      console.error("Fetch condition products error:", err);
      return res.status(500).json({ error: "Server error" });
  }
}

export const handleGetAllProductImages = async (req, res) => {
  try {
      const images = await skinCareService.getAllProductImages();
      return res.status(200).json({ success: true, message: "Product images fetched successfully", data: images });
  } catch (err) {
      console.error("Fetch product images error:", err);
      return res.status(500).json({ error: "Server error" });
  }
}