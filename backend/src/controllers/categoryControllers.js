import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    res.status(500).json({ message: "Server error while fetching category" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Category "${name.trim()}" already exists` });
    }
    const category = new Category({ name, description });
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ message: "Server error while creating category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Category "${name.trim()}" already exists` });
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true },
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productCount = await Product.countDocuments({
      category: req.params.id,
    });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì có ${productCount} sản phẩm đang thuộc danh mục. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Xóa danh mục thành công", category });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};
