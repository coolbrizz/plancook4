const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipes.controller");
const auth = require("../middleware/auth");

// Protected routes
router.get("/", auth, recipesController.getRecipes);
router.post("/", auth, recipesController.createRecipe);
router.get("/:id", auth, recipesController.getRecipe);
router.put("/:id", auth, recipesController.updateRecipe);
router.delete("/:id", auth, recipesController.deleteRecipe);

module.exports = router;
