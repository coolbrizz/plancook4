const Ingredient = require("../models/ingredient.model");

const testIngredients = [
  { name: "Poulet", category: "Viande" },
  { name: "Riz", category: "Féculent" },
  { name: "Carotte", category: "Légume" },
  { name: "Oignon", category: "Légume" },
  { name: "Ail", category: "Condiment" },
];

// Create new ingredient
exports.createIngredient = async (req, res) => {
  try {
    const { name, category } = req.body;
    const ingredient = new Ingredient({ name, category });
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    console.error("Error in createIngredient:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all ingredients
exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });

    // If no ingredients exist, create test data
    if (ingredients.length === 0) {
      const savedIngredients = await Ingredient.insertMany(testIngredients);
      return res.json(savedIngredients);
    }

    res.json(ingredients);
  } catch (error) {
    console.error("Error getting ingredients:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get ingredient by ID
exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const ingredient = await Ingredient.findByIdAndUpdate(
      id,
      { name, category },
      { new: true }
    );
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.json({ message: "Ingredient deleted" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    res.status(500).json({ message: error.message });
  }
};
