require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/user");

async function seedDemo() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error(
      "Set DEMO_EMAIL and a DEMO_PASSWORD of at least 8 characters.",
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: process.env.DEMO_NAME || "Jahid Khan",
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
    });
  }

  const existingTasks = await Task.countDocuments({ owner: user._id });
  if (!existingTasks) {
    const daysFromNow = (days, hour) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      date.setHours(hour, 0, 0, 0);
      return date;
    };
    await Task.insertMany([
      {
        owner: user._id,
        title: "Atlas product launch",
        description:
          "Bring the launch plan, landing page, and release checklist together for a confident product release.",
        category: "Product",
        priority: "High",
        status: "in-progress",
        estimate: 8,
        trackedSeconds: 10800,
        dueDate: daysFromNow(1, 17),
        location: "Remote",
        clientName: user.name,
      },
      {
        owner: user._id,
        title: "Design system refresh",
        description:
          "Refine the core component library, document interaction states, and align the visual language across the workspace.",
        category: "Design",
        priority: "Medium",
        status: "in-progress",
        estimate: 6,
        trackedSeconds: 5400,
        dueDate: daysFromNow(3, 15),
        location: "Remote",
        clientName: user.name,
      },
      {
        owner: user._id,
        title: "Analytics dashboard",
        description:
          "Build a clear, accessible overview of key product metrics with useful filters and responsive visualizations.",
        category: "Engineering",
        priority: "High",
        status: "todo",
        estimate: 12,
        trackedSeconds: 0,
        dueDate: daysFromNow(5, 16),
        location: "Remote",
        clientName: user.name,
      },
    ]);
  }

  console.log(`Demo account is ready for ${email}.`);
  await mongoose.disconnect();
}

seedDemo().catch(async (error) => {
  console.error("Could not seed the OrbitDesk demo account:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
