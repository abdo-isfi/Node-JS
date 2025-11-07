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

// Controller to handle getting all todos with filtering, searching, and pagination
const getAllTodos = (req, res) => {
  const { status, q, page, limit } = req.query;
  const result = getFilteredAndSortedTodos(status, q, page, limit);
  res.json(result);
};

// Controller to handle getting a single todo by ID
const getTodoById = (req, res) => {
  const todo = getTodoByIdService(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
};

// Controller to handle creating a new todo
const createTodo = async (req, res) => {
  const { title, priority, dueDate } = req.body;

  const newTodoData = {
    title,
    priority: priority || "medium",
    dueDate,
  };
  // Validate input data
  const error = validateTodo(newTodoData);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.error,
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }
  // Create the new todo
  try {
    const newTodo = await createTodoService(title, priority, dueDate);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// Controller to handle updating an existing todo
const updateTodo = async (req, res) => {
  
  const { id } = req.params;
  const updateData = req.body;

  const error = validateTodoUpdate(updateData);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.error,
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const updatedTodo = await updateTodoService(id, updateData);
    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// Controller to handle deleting a todo
const deleteTodo = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteTodoService(id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

// Controller to handle toggling the completion status of a todo
const toggleTodoCompletion = async (req, res) => {
  const { id } = req.params;
  try {
    const toggledTodo = await toggleTodoCompletionService(id);
    if (!toggledTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(toggledTodo);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: 500,
      timestamp: new Date().toISOString(),
    });
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
