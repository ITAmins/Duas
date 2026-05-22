import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to read the JSON file safely and dynamically
const getDuasData = () => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'duas.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading schemas or duas.json:', error);
    return [];
  }
};

/**
 * @route   GET /api/duas
 * @desc    Get all available duas
 * @access  Public
 */
router.get('/duas', (req, res, next) => {
  try {
    const duas = getDuasData();
    res.json({
      success: true,
      count: duas.length,
      data: duas
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/random
 * @desc    Get a single random dua
 * @access  Public
 */
router.get('/random', (req, res, next) => {
  try {
    const duas = getDuasData();
    if (duas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No duas found in database.'
      });
    }
    const randomIndex = Math.floor(Math.random() * duas.length);
    const randomDua = duas[randomIndex];
    res.json({
      success: true,
      data: randomDua
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/search
 * @desc    Search duas by any term in Bengali, English or Arabic
 * @query   q (Standard query parameter)
 * @access  Public
 */
router.get('/search', (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Missing search query parameter. Please use '/api/search?q=your_query'"
      });
    }

    const searchTerm = String(query).toLowerCase().trim();
    const duas = getDuasData();

    // Filter based on diverse fields
    const filteredDuas = duas.filter(dua => {
      return (
        dua.title_bn.toLowerCase().includes(searchTerm) ||
        dua.title_en.toLowerCase().includes(searchTerm) ||
        dua.meaning_bn.toLowerCase().includes(searchTerm) ||
        dua.pronunciation_bn.toLowerCase().includes(searchTerm) ||
        dua.category.toLowerCase().includes(searchTerm) ||
        dua.arabic.includes(searchTerm)
      );
    });

    res.json({
      success: true,
      query: searchTerm,
      count: filteredDuas.length,
      data: filteredDuas
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/duas/:id
 * @desc    Get a single dua by numeric ID
 * @access  Public
 */
router.get('/duas/:id', (req, res, next) => {
  try {
    const idParam = parseInt(req.params.id, 10);
    if (isNaN(idParam)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dua ID. ID must be an integer.'
      });
    }

    const duas = getDuasData();
    const dua = duas.find(d => d.id === idParam);

    if (!dua) {
      return res.status(404).json({
        success: false,
        message: `Dua with ID ${idParam} not found.`
      });
    }

    res.json({
      success: true,
      data: dua
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/category/:name
 * @desc    Get all duas within a category (case-insensitive)
 * @access  Public
 */
router.get('/category/:name', (req, res, next) => {
  try {
    const categoryName = req.params.name.toLowerCase().trim();
    const duas = getDuasData();

    const filteredDuas = duas.filter(d => d.category.toLowerCase() === categoryName);

    if (filteredDuas.length === 0) {
      // Also try fuzzy search if there's no exact match, to be mobile friendly
      const fuzzyDuas = duas.filter(d => d.category.toLowerCase().includes(categoryName));
      if (fuzzyDuas.length > 0) {
        return res.json({
          success: true,
          category: req.params.name,
          count: fuzzyDuas.length,
          data: fuzzyDuas
        });
      }

      return res.status(404).json({
        success: false,
        message: `No duas found in category '${req.params.name}'.`
      });
    }

    res.json({
      success: true,
      category: req.params.name,
      count: filteredDuas.length,
      data: filteredDuas
    });
  } catch (err) {
    next(err);
  }
});

export default router;
