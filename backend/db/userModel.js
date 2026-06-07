const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    budget: { type: Number, default: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'transactions' }]
}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);
