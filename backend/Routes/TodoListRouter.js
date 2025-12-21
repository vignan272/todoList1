const express = require("express");
const ensureAuthenticated = require("../Middlewares/Auth");
const TodoModel = require("../Models/TodoList");

const router = express.Router();

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/* 🔧 Normalize expiryAt and FIX timezone */
const normalizeExpiry = (expiryAt) => {
  if (expiryAt === null || expiryAt === undefined) return null;

  let ts = null;

  // number → timestamp
  if (typeof expiryAt === "number") {
    ts = expiryAt;
  }

  // string → timestamp
  if (typeof expiryAt === "string") {
    ts = new Date(expiryAt).getTime();
  }

  if (ts === null || isNaN(ts)) return null;

  // ✅ SUBTRACT 5h 30m (IST FIX)
  return ts - IST_OFFSET_MS;
};

/* ================= CREATE TODO ================= */
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name, isDone, expiryAt, priority, alarmEnabled } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "name is required" });
    }

    const fixedExpiry = normalizeExpiry(expiryAt);

    const todo = await TodoModel.create({
      name,
      isDone: Boolean(isDone),
      expiryAt: fixedExpiry,
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

/* ================= GET TODOS ================= */
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

/* ================= UPDATE TODO ================= */
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { name, isDone, expiryAt, priority, alarmEnabled } = req.body;

    const fixedExpiry =
      expiryAt !== undefined ? normalizeExpiry(expiryAt) : undefined;

    const updatedTodo = await TodoModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(name !== undefined && { name }),
        ...(isDone !== undefined && { isDone: Boolean(isDone) }),
        ...(fixedExpiry !== undefined && { expiryAt: fixedExpiry }),
        ...(priority !== undefined && { priority }),
        ...(alarmEnabled !== undefined && { alarmEnabled }),
      },
      { new: true }
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

/* ================= DELETE TODO ================= */
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const deleted = await TodoModel.findOneAndDelete({
      _id: req.params.id,
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

/* ================= DELETE ALL ================= */
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
