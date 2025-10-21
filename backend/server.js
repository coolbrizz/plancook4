require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

// Routes (using Supabase controllers)
app.use("/api/ingredients", require("./routes/ingredients.routes.supabase"));
app.use("/api/recipes", require("./routes/recipes.routes.supabase"));
app.use("/api/daily-meals", require("./routes/daily-meals.routes.supabase"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "PlanCook API - Running with Supabase" });
});

// Export for Vercel serverless
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Using Supabase PostgreSQL`);
  });
}
