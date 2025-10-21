/**
 * Script d'import JSON → Supabase
 * Importe toutes les données JSON dans Supabase PostgreSQL
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "migration-data");

// Init Supabase avec service key (bypass RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Variables manquantes: SUPABASE_URL ou SUPABASE_SERVICE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Maps pour garder les correspondances MongoDB ID → Supabase UUID
const userIdMap = new Map();
const ingredientIdMap = new Map();
const recipeIdMap = new Map();

async function importData() {
  try {
    console.log("🚀 Début de l'import vers Supabase\n");

    // 1. Import Users (créer dans auth.users via Supabase Admin)
    console.log("👤 Import des users...");
    const usersData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "users.json"), "utf-8")
    );

    let userCount = 0;
    for (const user of usersData) {
      try {
        // Créer user dans Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password, // Hash MongoDB → copié tel quel (attention: il faudra reset password!)
          email_confirm: true,
          user_metadata: {
            username: user.username,
            migrated_from_mongodb: true,
          },
        });

        if (error) {
          console.error(`   ⚠️  Erreur user ${user.email}:`, error.message);
          continue;
        }

        // Mapper ancien ID → nouveau UUID
        userIdMap.set(user._id.toString(), data.user.id);
        userCount++;
      } catch (err) {
        console.error(`   ⚠️  Erreur user ${user.email}:`, err.message);
      }
    }
    console.log(`   ✅ ${userCount}/${usersData.length} users importés\n`);

    // 2. Import Ingredients
    console.log("🥕 Import des ingredients...");
    const ingredientsData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "ingredients.json"), "utf-8")
    );

    const ingredientsToInsert = ingredientsData.map((ing) => ({
      name: ing.name,
      category: ing.category,
    }));

    const { data: insertedIngredients, error: ingError } = await supabase
      .from("ingredients")
      .insert(ingredientsToInsert)
      .select();

    if (ingError) {
      console.error("   ❌ Erreur ingredients:", ingError);
    } else {
      // Mapper par nom (car unique)
      ingredientsData.forEach((oldIng) => {
        const newIng = insertedIngredients.find((i) => i.name === oldIng.name);
        if (newIng) {
          ingredientIdMap.set(oldIng._id.toString(), newIng.id);
        }
      });
      console.log(`   ✅ ${insertedIngredients.length} ingredients importés\n`);
    }

    // 3. Import Recipes
    console.log("🍽️  Import des recipes...");
    const recipesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "recipes.json"), "utf-8")
    );

    for (const recipe of recipesData) {
      // Insérer la recipe
      const { data: insertedRecipe, error: recError } = await supabase
        .from("recipes")
        .insert({ name: recipe.name })
        .select()
        .single();

      if (recError) {
        console.error(`   ⚠️  Erreur recipe ${recipe.name}:`, recError.message);
        continue;
      }

      recipeIdMap.set(recipe._id.toString(), insertedRecipe.id);

      // Insérer les liens recipe-ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const recipeIngredients = recipe.ingredients
          .map((ing) => {
            const ingredientId = ingredientIdMap.get(
              typeof ing === "object" ? ing._id.toString() : ing.toString()
            );
            if (!ingredientId) return null;
            return {
              recipe_id: insertedRecipe.id,
              ingredient_id: ingredientId,
            };
          })
          .filter(Boolean);

        if (recipeIngredients.length > 0) {
          const { error: linkError } = await supabase
            .from("recipe_ingredients")
            .insert(recipeIngredients);

          if (linkError) {
            console.error(
              `   ⚠️  Erreur liens recipe ${recipe.name}:`,
              linkError.message
            );
          }
        }
      }
    }
    console.log(`   ✅ ${recipesData.length} recipes importées\n`);

    // 4. Import Daily Meals
    console.log("📅 Import des daily meals...");
    const dailyMealsData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "daily-meals.json"), "utf-8")
    );

    let mealCount = 0;
    for (const meal of dailyMealsData) {
      // Mapper user
      const supabaseUserId = userIdMap.get(meal.user.toString());
      if (!supabaseUserId) {
        console.error(`   ⚠️  User non trouvé pour meal: ${meal._id}`);
        continue;
      }

      // Mapper recipes
      const lunchRecipeId = meal.lunch?.recipe
        ? recipeIdMap.get(
            typeof meal.lunch.recipe === "object"
              ? meal.lunch.recipe._id.toString()
              : meal.lunch.recipe.toString()
          )
        : null;

      const dinnerRecipeId = meal.dinner?.recipe
        ? recipeIdMap.get(
            typeof meal.dinner.recipe === "object"
              ? meal.dinner.recipe._id.toString()
              : meal.dinner.recipe.toString()
          )
        : null;

      // Insérer daily meal
      const { data: insertedMeal, error: mealError } = await supabase
        .from("daily_meals")
        .insert({
          user_id: supabaseUserId,
          date: new Date(meal.date).toISOString().split("T")[0],
          lunch_recipe_id: lunchRecipeId,
          dinner_recipe_id: dinnerRecipeId,
        })
        .select()
        .single();

      if (mealError) {
        console.error(`   ⚠️  Erreur meal ${meal._id}:`, mealError.message);
        continue;
      }

      // Insérer lunch ingredients
      if (meal.lunch?.ingredients && meal.lunch.ingredients.length > 0) {
        const lunchIngredients = meal.lunch.ingredients
          .map((ing) => {
            const ingredientId = ingredientIdMap.get(
              typeof ing === "object" ? ing._id.toString() : ing.toString()
            );
            if (!ingredientId) return null;
            return {
              daily_meal_id: insertedMeal.id,
              ingredient_id: ingredientId,
            };
          })
          .filter(Boolean);

        if (lunchIngredients.length > 0) {
          await supabase
            .from("daily_meal_lunch_ingredients")
            .insert(lunchIngredients);
        }
      }

      // Insérer dinner ingredients
      if (meal.dinner?.ingredients && meal.dinner.ingredients.length > 0) {
        const dinnerIngredients = meal.dinner.ingredients
          .map((ing) => {
            const ingredientId = ingredientIdMap.get(
              typeof ing === "object" ? ing._id.toString() : ing.toString()
            );
            if (!ingredientId) return null;
            return {
              daily_meal_id: insertedMeal.id,
              ingredient_id: ingredientId,
            };
          })
          .filter(Boolean);

        if (dinnerIngredients.length > 0) {
          await supabase
            .from("daily_meal_dinner_ingredients")
            .insert(dinnerIngredients);
        }
      }

      mealCount++;
    }
    console.log(
      `   ✅ ${mealCount}/${dailyMealsData.length} daily meals importés\n`
    );

    console.log("✅ Import terminé!");
    console.log("\n📊 Résumé:");
    console.log(`   - Users: ${userCount}/${usersData.length}`);
    console.log(
      `   - Ingredients: ${insertedIngredients?.length || 0}/${
        ingredientsData.length
      }`
    );
    console.log(`   - Recipes: ${recipesData.length}`);
    console.log(`   - Daily Meals: ${mealCount}/${dailyMealsData.length}`);

    console.log(
      "\n⚠️  IMPORTANT: Les mots de passe sont des hashs MongoDB non compatibles."
    );
    console.log(
      "   Les users devront réinitialiser leur mot de passe via le flow Supabase."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    process.exit(1);
  }
}

importData();
