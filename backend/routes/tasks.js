const express = require("express");
const requireAuth = require("../middleware/require-auth");
const taskController = require("../controllers/tasks");

const router = express.Router();

router.get("/tasks", requireAuth, taskController.list);
router.post("/tasks", requireAuth, taskController.create);
router.patch("/tasks/:id", requireAuth, taskController.update);
router.delete("/tasks/:id", requireAuth, taskController.remove);

module.exports = router;
