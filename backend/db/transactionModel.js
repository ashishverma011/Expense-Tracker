const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('transactions', transactionSchema);
