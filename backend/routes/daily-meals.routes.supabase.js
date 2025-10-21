const express = require("express");
const router = express.Router();
const dailyMealsController = require("../controllers/daily-meals.controller.supabase");
const auth = require("../middleware/auth");

// All daily meal routes require authentication
router.get("/", auth, dailyMealsController.getDailyMeals);
router.post("/", auth, dailyMealsController.createDailyMeal);

module.exports = router;
