const express = require("express");
const router = express.Router();
const ingredientsController = require("../controllers/ingredients.controller");
const auth = require("../middleware/auth");

// Protected routes
router.get("/", auth, ingredientsController.getIngredients);
router.post("/", auth, ingredientsController.createIngredient);
router.get("/:id", auth, ingredientsController.getIngredient);
router.put("/:id", auth, ingredientsController.updateIngredient);
router.delete("/:id", auth, ingredientsController.deleteIngredient);

module.exports = router;
