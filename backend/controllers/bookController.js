const Book = require('../models/Book');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

// Generate a unique published code
const generatePublishedCode = async () => {
  const prefix = 'eduIT';
  const lastBook = await Book.findOne().sort({publishedCode: -1});

  let counter = 1;
  if (lastBook && lastBook.publishedCode) {
    const lastCode = lastBook.publishedCode;
    const numericPart = lastCode.replace(prefix, '');
    if (!isNaN(parseInt(numericPart))) {
      counter = parseInt(numericPart) + 1;
    }
  }

  // Format counter to have 3 digits
  return `${prefix}${counter.toString().padStart(3, '0')}`;
};

// Upload a new book
exports.uploadBook = async (req, res) => {
  try {
    const {title, description, categoryId} = req.body;
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({message: 'PDF file is required'});
    }

    if (!title || !description || !categoryId) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(pdfFile.path);
      return res.status(400).json({message: 'All fields are required'});
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      fs.unlinkSync(pdfFile.path);
      return res.status(404).json({message: 'Category not found'});
    }

    // Generate published code
    const publishedCode = await generatePublishedCode();

    // Create new book
    const book = new Book({
      title,
      description,
      category: categoryId,
      pdfPath: pdfFile.path,
      publishedCode,
    });

    await book.save();

    res.status(201).json({
      message: 'Book uploaded successfully',
      book: {
        ...book._doc,
        pdfPath: `${req.protocol}://${req.get('host')}/${pdfFile.path}`,
      },
    });
  } catch (error) {
    console.error('Error uploading book:', error);
    // Remove uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({message: 'Server error'});
  }
};

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('category', 'name')
      .sort('-createdAt');

    const formattedBooks = books.map(book => ({
      id: book._id,
      title: book.title,
      description: book.description,
      categoryName: book.category.name,
      publishedCode: book.publishedCode,
      pdfUrl: `${req.protocol}://${req.get('host')}/${book.pdfPath}`,
    }));

    res.json(formattedBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({message: 'Server error'});
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      'category',
      'name',
    );

    if (!book) {
      return res.status(404).json({message: 'Book not found'});
    }

    res.json({
      id: book._id,
      title: book.title,
      description: book.description,
      categoryName: book.category.name,
      publishedCode: book.publishedCode,
      pdfUrl: `${req.protocol}://${req.get('host')}/${book.pdfPath}`,
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({message: 'Server error'});
  }
};
