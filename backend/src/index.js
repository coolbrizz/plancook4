const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Autorise toutes les origines pour React Native
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json());

// Routes (using Supabase controllers)
app.use("/api/ingredients", require("../routes/ingredients.routes.supabase"));
app.use("/api/recipes", require("../routes/recipes.routes.supabase"));
app.use("/api/daily-meals", require("../routes/daily-meals.routes.supabase"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "PlanCook API - Running with Supabase" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Using Supabase PostgreSQL`);
});
