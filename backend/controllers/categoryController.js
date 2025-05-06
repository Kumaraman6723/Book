// controllers/categoryController.js
const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({message: 'Server error'});
  }
};

// Create a new category (admin function)
exports.createCategory = async (req, res) => {
  try {
    const {name} = req.body;
    if (!name) {
      return res.status(400).json({message: 'Category name is required'});
    }

    const existingCategory = await Category.findOne({name});
    if (existingCategory) {
      return res.status(400).json({message: 'Category already exists'});
    }

    const category = new Category({name});
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({message: 'Server error'});
  }
};
