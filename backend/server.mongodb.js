require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const dailyMealsController = require("./controllers/daily-meals.controller");

const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://plancook.vercel.app", "https://plancook.app"]
        : "http://localhost:8081",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json());

// Routes
app.use("/api/ingredients", require("./routes/ingredients.routes"));
app.use("/api/recipes", require("./routes/recipes.routes"));
app.use("/api/daily-meals", require("./routes/daily-meals.routes"));

// Schedule cleanup job to run at midnight every day
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily cleanup of old meals...");
  await dailyMealsController.cleanupOldMeals();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(5000, "0.0.0.0", () => {
  console.log("Server is running on port 5000");
});
