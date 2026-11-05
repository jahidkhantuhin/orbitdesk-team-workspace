const mongoose = require("mongoose");
const Task = require("../models/task");

const categories = ["Product", "Design", "Engineering", "Research", "Planning"];
const priorities = ["High", "Medium", "Low"];
const statuses = ["todo", "in-progress", "review", "completed"];

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeTask(input, partial = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createError("A task object is required.", 422);
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "priority",
    "status",
    "estimate",
    "trackedSeconds",
    "dueDate",
    "location",
    "clientName",
  ];
  const changes = {};
  const has = (field) => Object.prototype.hasOwnProperty.call(input, field);

  if (!partial || has("title")) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title || title.length > 100) {
      throw createError("Task title must contain 1 to 100 characters.", 422);
    }
    changes.title = title;
  }

  if (!partial || has("description")) {
    const description =
      typeof input.description === "string" ? input.description.trim() : "";
    if (!description || description.length > 1000) {
      throw createError(
        "Task description must contain 1 to 1000 characters.",
        422,
      );
    }
    changes.description = description;
  }

  for (const [field, values] of [
    ["category", categories],
    ["priority", priorities],
    ["status", statuses],
  ]) {
    if (has(field)) {
      if (!values.includes(input[field])) {
        throw createError(`Task ${field} is not valid.`, 422);
      }
      changes[field] = input[field];
    } else if (!partial) {
      changes[field] =
        field === "category"
          ? "Product"
          : field === "priority"
            ? "Medium"
            : "todo";
    }
  }

  if (!partial || has("estimate")) {
    const estimate = Number(input.estimate);
    if (!Number.isFinite(estimate) || estimate < 0.25 || estimate > 500) {
      throw createError(
        "Task estimate must be between 0.25 and 500 hours.",
        422,
      );
    }
    changes.estimate = estimate;
  }

  if (has("trackedSeconds")) {
    const trackedSeconds = Number(input.trackedSeconds);
    if (
      !Number.isInteger(trackedSeconds) ||
      trackedSeconds < 0 ||
      trackedSeconds > 2147483647
    ) {
      throw createError(
        "Tracked time must be a non-negative whole number.",
        422,
      );
    }
    changes.trackedSeconds = trackedSeconds;
  } else if (!partial) {
    changes.trackedSeconds = 0;
  }

  if (!partial || has("dueDate")) {
    const dueDate = new Date(input.dueDate);
    if (!input.dueDate || Number.isNaN(dueDate.getTime())) {
      throw createError("A valid task due date is required.", 422);
    }
    changes.dueDate = dueDate;
  }

  for (const field of ["location", "clientName"]) {
    if (has(field) || !partial) {
      const value = input[field] == null ? "" : input[field];
      const limit = field === "location" ? 60 : 80;
      if (typeof value !== "string" || value.trim().length > limit) {
        throw createError(
          `Task ${field} must be at most ${limit} characters.`,
          422,
        );
      }
      changes[field] = value.trim();
    }
  }

  if (!partial) {
    changes.location = changes.location || "Remote";
  }
  if (partial && !Object.keys(changes).length) {
    throw createError("Provide at least one task field to update.", 422);
  }
  if (Object.keys(input).some((field) => !allowedFields.includes(field))) {
    throw createError("The request contains unsupported task fields.", 422);
  }

  return changes;
}

function serializeTask(task) {
  const value = task.toObject ? task.toObject() : task;
  return {
    id: value._id.toString(),
    title: value.title,
    description: value.description,
    category: value.category,
    priority: value.priority,
    status: value.status,
    estimate: value.estimate,
    trackedSeconds: value.trackedSeconds,
    dueDate: value.dueDate,
    createdAt: value.createdAt,
    location: value.location,
    clientName: value.clientName,
  };
}

exports.list = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.userId }).sort({
      dueDate: 1,
      createdAt: -1,
    });
    res.status(200).json({ tasks: tasks.map(serializeTask) });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const task = new Task({
      ...normalizeTask(req.body),
      owner: req.userId,
    });
    await task.save();
    res.status(201).json({ task: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createError("Task not found.", 404);
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { $set: normalizeTask(req.body, true) },
      { new: true, runValidators: true },
    );
    if (!task) {
      throw createError("Task not found.", 404);
    }
    res.status(200).json({ task: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createError("Task not found.", 404);
    }
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!task) {
      throw createError("Task not found.", 404);
    }
    res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};
