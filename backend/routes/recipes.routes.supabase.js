const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipes.controller.supabase");
const auth = require("../middleware/auth");

// All routes require authentication
router.get("/", auth, recipesController.getRecipes);
router.get("/:id", auth, recipesController.getRecipe);
router.post("/", auth, recipesController.createRecipe);
router.put("/:id", auth, recipesController.updateRecipe);
router.delete("/:id", auth, recipesController.deleteRecipe);

module.exports = router;
