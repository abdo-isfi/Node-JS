const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { 
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
} = require('../controllers/todos.controllers');

router.get('/todos', authenticate, authorize('admin'), getAllTodos);
router.get('/todos/:id', authenticate, getTodoById);
router.post('/todos', authenticate, createTodo);
router.patch('/todos/:id', authenticate, updateTodo);
router.delete('/todos/:id', authenticate, authorize('admin'), deleteTodo);
router.patch('/todos/:id/toggle', authenticate, toggleTodoCompletion);

module.exports = router;
