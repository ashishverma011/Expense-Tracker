const { createExpense, deleteExpense, getCategoryExpense, getAllExpenses, emailSender } = require('../controller/expenseController');
const authMiddleware = require('../utils/authMiddleware');

const router = require('express').Router();

// protect all expense routes
router.use(authMiddleware);

router.post('/add', createExpense);
router.post('/delete', deleteExpense);
router.get('/category', getCategoryExpense);
router.get('/all', getAllExpenses);
router.post('/sendEmail', emailSender);

module.exports = router;