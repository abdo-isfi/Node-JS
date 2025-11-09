const {
  getFilteredAndSortedTodos,
  createTodoService,
  getTodoByIdService,
  updateTodoService,
  deleteTodoService,
  toggleTodoCompletionService,
  validateTodo,
  validateTodoUpdate,
} = require("../services/todos.services");
const createHttpError = require('http-errors');

// Controller to handle getting all todos with filtering, searching, and pagination
const getAllTodos = async (req, res, next) => {
  try {
    const { status, q, page, limit } = req.query;
    const result = await getFilteredAndSortedTodos(req.user, status, q, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Controller to handle getting a single todo by ID
const getTodoById = async (req, res, next) => {
  try {
    const todo = await getTodoByIdService(req.user, req.params.id);
    if (!todo) {
      return next(createHttpError(404, "Todo not found"));
    }
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Controller to handle creating a new todo
const createTodo = async (req, res, next) => {
  try {
    const { title, priority, dueDate } = req.body;

    const newTodoData = {
      title,
      priority: priority || "medium",
      dueDate,
    };
    // Validate input data
    const error = validateTodo(newTodoData);
    if (error) {
      return next(createHttpError(400, error.error));
    }
    // Create the new todo
    const newTodo = await createTodoService(req.user, title, priority, dueDate);
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
};

// Controller to handle updating an existing todo
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const error = validateTodoUpdate(updateData);
    if (error) {
      return next(createHttpError(400, error.error));
    }

    const updatedTodo = await updateTodoService(req.user, id, updateData);
    if (!updatedTodo) {
      return next(createHttpError(404, "Todo not found"));
    }
    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
};

// Controller to handle deleting a todo
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTodoService(req.user, id);
    if (!deleted) {
      return next(createHttpError(404, "Todo not found"));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Controller to handle toggling the completion status of a todo
const toggleTodoCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const toggledTodo = await toggleTodoCompletionService(req.user, id);
    if (!toggledTodo) {
      return next(createHttpError(404, "Todo not found"));
    }
    res.json(toggledTodo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
};
