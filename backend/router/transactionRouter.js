const express = require('express');
const { createTransaction, updateTransaction, getTransactions, deleteTransaction, getSummary } = require('../controller/transactionController');
const authMiddleware = require('../utils/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
