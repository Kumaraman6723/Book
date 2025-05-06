// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - Get all categories
router.get('/categories', categoryController.getCategories);

// POST /api/categories - Create a new category (admin function)
router.post('/categories', categoryController.createCategory);

module.exports = router;
