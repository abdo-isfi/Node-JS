const express = require('express');
const router = express.Router();
const { 
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
} = require('../controllers/todos.controllers');

router.get('/todos', getAllTodos);
router.get('/todos/:id', getTodoById);
router.post('/todos', createTodo);
router.patch('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);
router.patch('/todos/:id/toggle', toggleTodoCompletion);

module.exports = router;
