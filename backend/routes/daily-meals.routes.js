const express = require("express");
const router = express.Router();
const dailyMealsController = require("../controllers/daily-meals.controller");
const auth = require("../middleware/auth");

// Protected routes
router.get("/", auth, dailyMealsController.getDailyMeals);
router.post("/", auth, dailyMealsController.createDailyMeal);

module.exports = router;
