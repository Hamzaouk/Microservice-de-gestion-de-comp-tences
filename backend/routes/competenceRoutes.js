const express = require('express');
const { getAll, create, update, remove} = require('../controllers/competenceController');

const router = express.Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Test route to check if JSON parsing works
router.post('/test', (req, res) => {
  console.log('Test route - Body:', req.body);
  res.json({ 
    message: 'Test successful', 
    received: req.body,
    bodyType: typeof req.body,
    isEmpty: Object.keys(req.body).length === 0
  });
});

module.exports = router;