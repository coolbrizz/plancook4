/**
 * Script d'export MongoDB → JSON
 * Export toutes les données MongoDB dans des fichiers JSON
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import models
const User = require("../models/user.model");
const Ingredient = require("../models/ingredient.model");
const Recipe = require("../models/recipe.model");
const DailyMeal = require("../models/daily-meal.model");

const DATA_DIR = path.join(__dirname, "migration-data");

async function exportData() {
  try {
    // Connexion MongoDB
    console.log("🔌 Connexion à MongoDB...");
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté\n");

    // Créer le dossier de données
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Export Users
    console.log("📦 Export des users...");
    const users = await User.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, "users.json"),
      JSON.stringify(users, null, 2)
    );
    console.log(`   ✅ ${users.length} users exportés`);

    // Export Ingredients
    console.log("📦 Export des ingredients...");
    const ingredients = await Ingredient.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, "ingredients.json"),
      JSON.stringify(ingredients, null, 2)
    );
    console.log(`   ✅ ${ingredients.length} ingredients exportés`);

    // Export Recipes
    console.log("📦 Export des recipes...");
    const recipes = await Recipe.find({}).populate("ingredients").lean();
    fs.writeFileSync(
      path.join(DATA_DIR, "recipes.json"),
      JSON.stringify(recipes, null, 2)
    );
    console.log(`   ✅ ${recipes.length} recipes exportées`);

    // Export Daily Meals
    console.log("📦 Export des daily meals...");
    const dailyMeals = await DailyMeal.find({})
      .populate("lunch.recipe")
      .populate("lunch.ingredients")
      .populate("dinner.recipe")
      .populate("dinner.ingredients")
      .lean();
    fs.writeFileSync(
      path.join(DATA_DIR, "daily-meals.json"),
      JSON.stringify(dailyMeals, null, 2)
    );
    console.log(`   ✅ ${dailyMeals.length} daily meals exportés`);

    console.log("\n✅ Export terminé!");
    console.log(`📁 Données exportées dans: ${DATA_DIR}`);

    // Statistiques
    console.log("\n📊 Statistiques:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Ingredients: ${ingredients.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - Daily Meals: ${dailyMeals.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'export:", error);
    process.exit(1);
  }
}

exportData();
