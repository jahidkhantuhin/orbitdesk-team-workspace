const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ["Product", "Design", "Engineering", "Research", "Planning"],
      default: "Product",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed"],
      default: "todo",
    },
    estimate: { type: Number, min: 0.25, max: 500, default: 1 },
    trackedSeconds: { type: Number, min: 0, max: 2147483647, default: 0 },
    dueDate: { type: Date, required: true },
    location: { type: String, trim: true, maxlength: 60, default: "Remote" },
    clientName: { type: String, trim: true, maxlength: 80, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
