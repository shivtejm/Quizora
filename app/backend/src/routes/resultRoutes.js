const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/', resultsController.getAllResults);
router.get('/stats', resultsController.getDashboardStats);
router.get('/:id', resultsController.getResultById);
router.post('/evaluate', resultsController.submitEvaluation);

module.exports = router;
