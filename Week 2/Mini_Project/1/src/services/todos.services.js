
const fs = require('fs').promises;
const path = require('path');

const todosFilePath = path.join(__dirname, '../data/todos.json');

let todos = [];

async function initializeTodos() {
    try {
        const data = await fs.readFile(todosFilePath, 'utf8');
        todos = JSON.parse(data);
        console.log('Todos loaded successfully.');
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('todos.json not found, initializing with empty array.');
            todos = [];
        } else {
            console.error('Error reading todos.json:', err.message);
            todos = []; // Fallback to empty array on other errors
        }
    }
}

async function saveTodos() {
    try {
        await fs.writeFile(todosFilePath, JSON.stringify(todos, null, 2), 'utf8');
        console.log('Todos saved successfully.');
    } catch (err) {
        console.error('Error writing todos.json:', err.message);
    }
}

function validateTodo(todo) {
    if (!todo.title) return { error: 'Title is required' };
    if (!todo.priority || !['low', 'medium', 'high'].includes(todo.priority)) {
        return { error: 'Priority must be low, medium, or high' };
    }
    if (todo.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
        return { error: 'Due date must be in YYYY-MM-DD format' };
    }
    return null;
}

function validateTodoUpdate(todo) {
    const allowedFields = ['title', 'priority', 'dueDate', 'completed'];
    for (const field in todo) {
        if (!allowedFields.includes(field)) {
            return { error: `Unknown field: ${field}` };
        }
    }
    if (todo.title && typeof todo.title !== 'string') return { error: 'Title must be a string' };
    if (todo.priority && !['low', 'medium', 'high'].includes(todo.priority)) {
        return { error: 'Priority must be low, medium, or high' };
    }
    if (todo.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
        return { error: 'Due date must be in YYYY-MM-DD format' };
    }
    if (todo.completed !== undefined && typeof todo.completed !== 'boolean') return { error: 'Completed must be a boolean' };

    return null;
}

function getFilteredAndSortedTodos(status, q, page = 1, limit = 10) {
    let filteredTodos = [...todos];

    if (status) {
        if (status === 'active') {
            filteredTodos = filteredTodos.filter(todo => todo.completed === false);
        } else if (status === 'completed') {
            filteredTodos = filteredTodos.filter(todo => todo.completed === true);
        }
    }

    if (q) {
        const searchTerm = q.toLowerCase();
        filteredTodos = filteredTodos.filter(todo => todo.title.toLowerCase().includes(searchTerm));
    }

    // Default sort by createdAt descending
    filteredTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filteredTodos.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTodos = filteredTodos.slice(startIndex, endIndex);
    const pages = Math.ceil(total / limit);

    return { data: paginatedTodos, total, page: parseInt(page), pages };
}

module.exports = {
    todos,
    validateTodo,
    validateTodoUpdate,
    getFilteredAndSortedTodos,
    saveTodos,
    initializeTodos,
    getTodoByIdService,
    createTodoService,
    updateTodoService,
    deleteTodoService,
    toggleTodoCompletionService
};
