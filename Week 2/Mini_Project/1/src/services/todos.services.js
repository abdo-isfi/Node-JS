const Todo = require('../models/todo.model');
const createHttpError = require('http-errors');

function validateTodo(todo) {
  if (!todo.title) return { error: "Title is required" };
  if (!todo.priority || !["low", "medium", "high"].includes(todo.priority)) {
    return { error: "Priority must be low, medium, or high" };
  }
  if (todo.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
    return { error: "Due date must be in YYYY-MM-DD format" };
  }
  return null;
}

function validateTodoUpdate(todo) {
  const allowedFields = ["title", "priority", "dueDate", "completed"];
  for (const field in todo) {
    if (!allowedFields.includes(field)) {
      return { error: `Unknown field: ${field}` };
    }
  }
  if (todo.title && typeof todo.title !== "string")
    return { error: "Title must be a string" };
  if (todo.priority && !["low", "medium", "high"].includes(todo.priority)) {
    return { error: "Priority must be low, medium, or high" };
  }
  if (todo.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
    return { error: "Due date must be in YYYY-MM-DD format" };
  }
  if (todo.completed !== undefined && typeof todo.completed !== "boolean")
    return { error: "Completed must be a boolean" };

  return null;
}

async function getFilteredAndSortedTodos(user, status, q, page = 1, limit = 10) {
  const filter = {};
  if (user.role === 'user') {
    filter.user = user._id;
  }
  if (status) {
    filter.completed = status === "completed";
  }
  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  const total = await Todo.countDocuments(filter);
  const paginatedTodos = await Todo.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const pages = Math.ceil(total / limit);

  return { data: paginatedTodos, total, page: parseInt(page), pages };
}

async function getTodoByIdService(user, id) {
    const filter = { id: id };
    if (user.role === 'user') {
        filter.user = user._id;
    }
    return await Todo.findOne(filter);
}

async function createTodoService(user, title, priority, dueDate) {
    const existingTodo = await Todo.findOne({ user: user._id, title: title });
    if (existingTodo) {
        throw createHttpError(400, 'You already have a todo with this title.');
    }

    const latestTodo = await Todo.findOne().sort({ id: -1 });
    const nextId = latestTodo ? latestTodo.id + 1 : 1;

    const newTodo = new Todo({
        id: nextId,
        title,
        priority: priority || 'medium',
        dueDate,
        completed: false,
        user: user._id, // Assign the todo to the authenticated user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    await newTodo.save();
    return newTodo;
}

async function updateTodoService(user, id, updateData) {
    const filter = { id: id };
    if (user.role === 'user') {
        filter.user = user._id;
    }
    const todo = await Todo.findOne(filter);
    if (!todo) {
        return null;
    }

    for (const key in updateData) {
        if (Object.prototype.hasOwnProperty.call(updateData, key)) {
            todo[key] = updateData[key];
        }
    }
    todo.updatedAt = new Date().toISOString();
    await todo.save();
    return todo;
}

async function deleteTodoService(user, id) {
    const filter = { id: id };
    if (user.role === 'user') {
        filter.user = user._id;
    }
    const result = await Todo.deleteOne(filter);
    return result.deletedCount > 0;
}

async function toggleTodoCompletionService(user, id) {
    const filter = { id: id };
    if (user.role === 'user') {
        filter.user = user._id;
    }
    const todo = await Todo.findOne(filter);
    if (!todo) {
        return null;
    }
    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    await todo.save();
    return todo;
}

module.exports = {
  validateTodo,
  validateTodoUpdate,
  getFilteredAndSortedTodos,
  getTodoByIdService,
  createTodoService,
  updateTodoService,
  deleteTodoService,
  toggleTodoCompletionService,
};
