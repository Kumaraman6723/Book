// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only PDF files are allowed'));
    }
  },
});

// POST /api/upload - Upload a book
router.post('/upload', upload.single('pdfFile'), bookController.uploadBook);

// GET /api/books - Get all books
router.get('/books', bookController.getBooks);

// GET /api/books/:id - Get a book by ID
router.get('/books/:id', bookController.getBookById);

module.exports = router;
