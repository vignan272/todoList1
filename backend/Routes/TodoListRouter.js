const express = require("express");
const ensureAuthenticated = require("../Middlewares/Auth");
const TodoModel = require("../Models/TodoList");

const router = express.Router();

/**
 * POST /api/todos
 * Create todo for logged-in user
 */
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name, isDone, expiryAt, priority, alarmEnabled } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const todo = await TodoModel.create({
      name,
      isDone: isDone ?? false,
      expiryAt: expiryAt ?? null,
      priority: priority ?? "Medium",
      alarmEnabled: alarmEnabled ?? true,
      userId: req.user._id,
    });

    return res.status(201).json(todo);
  } catch (err) {
    console.error("Create todo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/todos
 * Get all todos for logged-in user
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const todos = await TodoModel.find({ userId: req.user._id }).sort({
      expiryAt: 1,
      priority: -1,
    });

    return res.status(200).json(todos);
  } catch (err) {
    console.error("Get todos error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/todos/:id
 * Update todo by ID (only if it belongs to user)
 */
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isDone, expiryAt, priority, alarmEnabled } = req.body;

    const updatedTodo = await TodoModel.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      {
        ...(name !== undefined && { name }),
        ...(isDone !== undefined && { isDone }),
        ...(expiryAt !== undefined && { expiryAt }),
        ...(priority !== undefined && { priority }),
        ...(alarmEnabled !== undefined && { alarmEnabled }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json(updatedTodo);
  } catch (err) {
    console.error("Update todo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/todos/:id
 * Delete single todo by ID (only user's)
 */
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TodoModel.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Delete todo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/todos
 * Delete ALL todos of logged-in user
 */
router.delete("/", ensureAuthenticated, async (req, res) => {
  try {
    await TodoModel.deleteMany({ userId: req.user._id });
    return res.status(200).json({ message: "All todos removed" });
  } catch (err) {
    console.error("Delete all todos error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
