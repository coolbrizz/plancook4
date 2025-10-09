const mongoose = require("mongoose");
const Ingredient = require("../models/ingredient.model");
const Recipe = require("../models/recipe.model");
require("dotenv").config();

const rawRecipes = [
  {
    name: "Poulet riz",
    ingredients: ["Pate de poulet", "Riz"],
  },
  {
    name: "Saumon brocoli",
    ingredients: ["Saumon", "Brocoli"],
  },
  {
    name: "Pâtes au thon",
    ingredients: ["Thon", "Pâtes"],
  },
  {
    name: "Boeuf carottes",
    ingredients: ["Bœuf", "Carotte"],
  },
  {
    name: "Salade césar",
    ingredients: ["Blanc de poulet", "Laitue"],
  },
  {
    name: "Tarte poireau",
    ingredients: ["Œufs", "Poireau"],
  },
  {
    name: "Soupe de légumes",
    ingredients: ["Pomme de terre", "Carotte", "Poireau"],
  },
  {
    name: "Dinde curry carotte riz",
    ingredients: ["Dinde", "Carotte", "Riz"],
  },
  {
    name: "Tarte oignons",
    ingredients: ["Œufs", "oignon", "pate feuilleté"],
  },
  {
    name: "Spaghetti bolognaise",
    ingredients: ["Viande hachée", "Pâtes", "Sauce bolognaise"],
  },
  {
    name: "Spaghetti carbonara",
    ingredients: ["Lardons", "Œufs", "Pâtes", "Crème fraiche"],
  },
  {
    name: "Couscous",
    ingredients: ["Merguez", "Pate de poulet", "Semoule de blé", "Carotte"],
  },
  {
    name: "Steak frite",
    ingredients: ["Steak", "Frites"],
  },
  {
    name: "Merguez/ Taboulé",
    ingredients: ["Merguez", "Taboulé"],
  },
  {
    name: "Lentilles saucisse",
    ingredients: ["Saucisse fumé", "Lardons", "Lentilles", "Carotte", "oignon"],
  },
  {
    name: "Riz mexicain",
    ingredients: ["Chorizo", "Riz", "Poivron"],
  },
  {
    name: "Tarte oignons (thon)",
    ingredients: ["Thon", "Œufs", "pate feuilleté"],
  },
  {
    name: "Poulet/PDT/Flageolet",
    ingredients: ["Poulet entier", "Pomme de terre", "Flageolet"],
  },
  {
    name: "Croque Monsieur",
    ingredients: ["Jambon", "Pain de mie", "Emmental"],
  },
  {
    name: "Hot-Dog",
    ingredients: ["Saucisse porc", "Pain hotdog", "Cheddar", "oignon"],
  },
  {
    name: "Burger",
    ingredients: ["steak haché", "Pain burger", "oignon", "Cheddar", "Laitue"],
  },
  {
    name: "Salade fraiche",
    ingredients: ["Thon", "Tomate", "mais"],
  },
  {
    name: "Gratin choux fleurs",
    ingredients: ["Pomme de terre", "Chou", "Emmental"],
  },
  {
    name: "Gratin PDT lardons",
    ingredients: ["Lardons", "Pomme de terre", "Emmental"],
  },
  {
    name: "Nuggets Frites",
    ingredients: ["Nuggets", "Frites"],
  },
  {
    name: "Tomates / mozza",
    ingredients: ["Tomate", "Mozarella"],
  },
  {
    name: "Purée pomme de terre",
    ingredients: ["Pomme de terre"],
  },
  {
    name: "Tortilla",
    ingredients: ["steak haché", "Sauce bolognaise"],
  },
  {
    name: "Omelette",
    ingredients: ["œufs"],
  },
  {
    name: "Tarte au thon",
    ingredients: ["Thon", "pate feuilleté", "Œufs"],
  },
  {
    name: "Salade PDT",
    ingredients: ["Thon", "Tomate", "Emmental"],
  },
  {
    name: "Sandwich simple",
    ingredients: ["Jambon", "Emmental", "Tomate", "Pain de mie"],
  },
  {
    name: "Quiche",
    ingredients: ["Lardons", "Œufs", "Emmental", "pate feuilleté"],
  },
  {
    name: "Escalope dinde crème",
    ingredients: ["Dinde", "Crème fraiche", "Riz"],
  },
  {
    name: "Croissant au jambon",
    ingredients: ["Jambon", "Crème fraiche", "croissant"],
  },
  {
    name: "Hachi parmentier",
    ingredients: ["Viande hachée", "Pomme de terre", "gruyères"],
  },
  {
    name: "Lasagne",
    ingredients: ["Viande hachée", "Pâtes", "oignon"],
  },
  {
    name: "Poisson/ Pomme de terre",
    ingredients: ["Colin", "Pomme de terre", "Crème fraiche"],
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // Only delete recipes, keep existing ingredients
    await Recipe.deleteMany();

    // Get all existing ingredients
    const existingIngredients = await Ingredient.find();
    const ingredientMap = {};
    existingIngredients.forEach((ing) => {
      ingredientMap[ing.name.toLowerCase()] = ing._id;
    });

    // Create recipes with references to existing ingredients
    const recipesWithIds = rawRecipes.map((r) => ({
      name: r.name,
      ingredients: r.ingredients
        .map((name) => ingredientMap[name.toLowerCase()])
        .filter((id) => id !== undefined), // Filter out ingredients that don't exist
    }));

    // Log any missing ingredients
    rawRecipes.forEach((recipe) => {
      const missingIngredients = recipe.ingredients.filter(
        (name) => !ingredientMap[name.toLowerCase()]
      );
      if (missingIngredients.length > 0) {
        console.log(
          `Missing ingredients for ${recipe.name}:`,
          missingIngredients
        );
      }
    });

    await Recipe.insertMany(recipesWithIds);
    console.log("✅ Recettes insérées avec succès !");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err);
    mongoose.disconnect();
  });
