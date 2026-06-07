const transactionModel = require('../db/transactionModel');
const userModel = require('../db/userModel');
const { error, success } = require('../utils/handler');

const createTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, date } = req.body;
        if (!type || !amount || !category || !date)
            return res.send(error(400, 'All fields are required'));
        if (!['income', 'expense'].includes(type))
            return res.send(error(400, 'Type must be income or expense'));
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0)
            return res.send(error(400, 'Amount must be a positive number'));
        if (new Date(date).toString() === 'Invalid Date')
            return res.send(error(400, 'Invalid date'));

        const transaction = await transactionModel.create({
            userId: req.userId, type, amount: parsedAmount, category, description, date
        });
        await userModel.findByIdAndUpdate(req.userId, { $push: { transactions: transaction._id } });
        return res.send(success(201, transaction));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, date } = req.body;
        const { id } = req.params;
        if (!type || !amount || !category || !date)
            return res.send(error(400, 'All fields are required'));
        if (!['income', 'expense'].includes(type))
            return res.send(error(400, 'Type must be income or expense'));
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0)
            return res.send(error(400, 'Amount must be a positive number'));
        if (new Date(date).toString() === 'Invalid Date')
            return res.send(error(400, 'Invalid date'));

        const transaction = await transactionModel.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { type, amount: parsedAmount, category, description, date },
            { new: true }
        );
        if (!transaction)
            return res.send(error(404, 'Transaction not found'));
        return res.send(success(200, transaction));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const getTransactions = async (req, res) => {
    try {
        const { type, category, search, startDate, endDate } = req.query;
        const filter = { userId: req.userId };
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            filter.$or = [
                { description: regex },
                { category: regex }
            ];
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        const transactions = await transactionModel.find(filter).sort({ date: -1 });
        return res.send(success(200, transactions));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionModel.findOneAndDelete({ _id: id, userId: req.userId });
        if (!transaction)
            return res.send(error(404, 'Transaction not found'));
        await userModel.findByIdAndUpdate(req.userId, { $pull: { transactions: id } });
        return res.send(success(200, 'Deleted successfully'));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const getSummary = async (req, res) => {
    try {
        const transactions = await transactionModel.find({ userId: req.userId });
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const balance = totalIncome - totalExpense;

        const categoryBreakdown = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });

        const user = await userModel.findById(req.userId);
        const budgetAlert = user.budget > 0 && totalExpense >= user.budget * 0.8;

        return res.send(success(200, { totalIncome, totalExpense, balance, categoryBreakdown, budget: user.budget, budgetAlert }));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

module.exports = { createTransaction, updateTransaction, getTransactions, deleteTransaction, getSummary };
