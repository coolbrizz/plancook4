const express = require("express");
const router = express.Router();
const ingredientsController = require("../controllers/ingredients.controller.supabase");
const auth = require("../middleware/auth");

// All routes require authentication
router.get("/", auth, ingredientsController.getIngredients);
router.get("/:id", auth, ingredientsController.getIngredient);
router.post("/", auth, ingredientsController.createIngredient);
router.put("/:id", auth, ingredientsController.updateIngredient);
router.delete("/:id", auth, ingredientsController.deleteIngredient);

module.exports = router;
