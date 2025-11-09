const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}); // Removed { _id: false }

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
