const { todos, validateTodo, validateTodoUpdate, getFilteredAndSortedTodos, saveTodos } = require('../services/todos.services');

const getAllTodos = (req, res) => {
    const { status, q, page, limit } = req.query;
    const result = getFilteredAndSortedTodos(status, q, page, limit);
    res.json(result);
};

const getTodoById = (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
};

const createTodo = async (req, res) => {
    const { title, priority, dueDate } = req.body;

    const nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    const newTodo = {
        id: nextId,
        title,
        priority: priority || 'medium',
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const error = validateTodo(newTodo);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.error, code: 400, timestamp: new Date().toISOString() });
    }

    todos.push(newTodo);
    await saveTodos();
    res.status(201).json(newTodo);
};

const updateTodo = async (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const error = validateTodoUpdate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.error, code: 400, timestamp: new Date().toISOString() });
    }

    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            todo[key] = req.body[key];
        }
    }
    todo.updatedAt = new Date().toISOString();
    await saveTodos();
    res.json(todo);
};

const deleteTodo = async (req, res) => {
    const index = todos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    todos.splice(index, 1);
    await saveTodos();
    res.status(204).send();
};

const toggleTodoCompletion = async (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    await saveTodos();
    res.json(todo);
};

module.exports = {
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
};
