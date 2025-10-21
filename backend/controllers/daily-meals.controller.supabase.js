const { supabase } = require("../config/supabase");

// Get all daily meals for a specific user
exports.getDailyMeals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clean up old meals first
    await cleanupOldMeals(userId);

    // Fetch daily meals
    const { data: dailyMeals, error } = await supabase
      .from("daily_meals")
      .select(
        `
        id,
        date,
        created_at,
        updated_at,
        lunch_recipe:recipes!daily_meals_lunch_recipe_id_fkey(id, name),
        dinner_recipe:recipes!daily_meals_dinner_recipe_id_fkey(id, name)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;

    // Fetch lunch and dinner ingredients for each meal
    const mealsWithIngredients = await Promise.all(
      dailyMeals.map(async (meal) => {
        // Fetch lunch ingredients
        const { data: lunchIngredients } = await supabase
          .from("daily_meal_lunch_ingredients")
          .select(
            `
            ingredient:ingredients(id, name, category)
          `
          )
          .eq("daily_meal_id", meal.id);

        // Fetch dinner ingredients
        const { data: dinnerIngredients } = await supabase
          .from("daily_meal_dinner_ingredients")
          .select(
            `
            ingredient:ingredients(id, name, category)
          `
          )
          .eq("daily_meal_id", meal.id);

        return {
          _id: meal.id.toString(),
          id: meal.id,
          user: userId,
          date: meal.date,
          lunch: {
            recipe: meal.lunch_recipe
              ? {
                  _id: meal.lunch_recipe.id.toString(),
                  id: meal.lunch_recipe.id,
                  name: meal.lunch_recipe.name,
                }
              : null,
            ingredients:
              lunchIngredients?.map((li) => ({
                _id: li.ingredient.id.toString(),
                id: li.ingredient.id,
                name: li.ingredient.name,
                category: li.ingredient.category,
              })) || [],
          },
          dinner: {
            recipe: meal.dinner_recipe
              ? {
                  _id: meal.dinner_recipe.id.toString(),
                  id: meal.dinner_recipe.id,
                  name: meal.dinner_recipe.name,
                }
              : null,
            ingredients:
              dinnerIngredients?.map((di) => ({
                _id: di.ingredient.id.toString(),
                id: di.ingredient.id,
                name: di.ingredient.name,
                category: di.ingredient.category,
              })) || [],
          },
          created_at: meal.created_at,
          updated_at: meal.updated_at,
        };
      })
    );

    // If no meals exist, create test data
    if (mealsWithIngredients.length === 0) {
      const today = new Date().toISOString().split("T")[0];

      const { data: testMeal, error: insertError } = await supabase
        .from("daily_meals")
        .insert({
          user_id: userId,
          date: today,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return res.json([
        {
          _id: testMeal.id.toString(),
          id: testMeal.id,
          user: userId,
          date: testMeal.date,
          lunch: { recipe: null, ingredients: [] },
          dinner: { recipe: null, ingredients: [] },
          created_at: testMeal.created_at,
          updated_at: testMeal.updated_at,
        },
      ]);
    }

    res.json(mealsWithIngredients);
  } catch (error) {
    console.error("Error getting daily meals:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cleanup function to delete meals older than 3 days
async function cleanupOldMeals(userId) {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_meals")
      .delete()
      .eq("user_id", userId)
      .lt("date", threeDaysAgoStr)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Deleted ${data.length} old meals for user ${userId}`);
    }
  } catch (error) {
    console.error("Error cleaning up old meals:", error);
  }
}

// Create or update a daily meal
exports.createDailyMeal = async (req, res) => {
  try {
    const { date, lunch, dinner } = req.body;
    const userId = req.user.id;

    console.log("Creating/updating meal for user:", userId);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Normalize date to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split("T")[0];

    // Check if meal exists for this date
    const { data: existingMeal, error: fetchError } = await supabase
      .from("daily_meals")
      .select("id")
      .eq("user_id", userId)
      .eq("date", normalizedDate)
      .single();

    let mealId;

    if (existingMeal) {
      // Update existing meal
      const { data: updatedMeal, error: updateError } = await supabase
        .from("daily_meals")
        .update({
          lunch_recipe_id: lunch.recipe || null,
          dinner_recipe_id: dinner.recipe || null,
        })
        .eq("id", existingMeal.id)
        .select()
        .single();

      if (updateError) throw updateError;
      mealId = updatedMeal.id;

      // Delete existing ingredient links
      await supabase
        .from("daily_meal_lunch_ingredients")
        .delete()
        .eq("daily_meal_id", mealId);

      await supabase
        .from("daily_meal_dinner_ingredients")
        .delete()
        .eq("daily_meal_id", mealId);
    } else {
      // Create new meal
      const { data: newMeal, error: insertError } = await supabase
        .from("daily_meals")
        .insert({
          user_id: userId,
          date: normalizedDate,
          lunch_recipe_id: lunch.recipe || null,
          dinner_recipe_id: dinner.recipe || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      mealId = newMeal.id;
    }

    // Insert lunch ingredients
    if (lunch.ingredients && lunch.ingredients.length > 0) {
      const lunchIngredients = lunch.ingredients.map((ingredientId) => ({
        daily_meal_id: mealId,
        ingredient_id: ingredientId,
      }));

      const { error: lunchError } = await supabase
        .from("daily_meal_lunch_ingredients")
        .insert(lunchIngredients);

      if (lunchError) throw lunchError;
    }

    // Insert dinner ingredients
    if (dinner.ingredients && dinner.ingredients.length > 0) {
      const dinnerIngredients = dinner.ingredients.map((ingredientId) => ({
        daily_meal_id: mealId,
        ingredient_id: ingredientId,
      }));

      const { error: dinnerError } = await supabase
        .from("daily_meal_dinner_ingredients")
        .insert(dinnerIngredients);

      if (dinnerError) throw dinnerError;
    }

    // Fetch complete meal with all relations
    const { data: completeMeal, error: fetchCompleteError } = await supabase
      .from("daily_meals")
      .select(
        `
        id,
        date,
        created_at,
        updated_at,
        lunch_recipe:recipes!daily_meals_lunch_recipe_id_fkey(id, name),
        dinner_recipe:recipes!daily_meals_dinner_recipe_id_fkey(id, name)
      `
      )
      .eq("id", mealId)
      .single();

    if (fetchCompleteError) throw fetchCompleteError;

    // Fetch lunch ingredients
    const { data: lunchIngredients } = await supabase
      .from("daily_meal_lunch_ingredients")
      .select(
        `
        ingredient:ingredients(id, name, category)
      `
      )
      .eq("daily_meal_id", mealId);

    // Fetch dinner ingredients
    const { data: dinnerIngredients } = await supabase
      .from("daily_meal_dinner_ingredients")
      .select(
        `
        ingredient:ingredients(id, name, category)
      `
      )
      .eq("daily_meal_id", mealId);

    const response = {
      _id: completeMeal.id.toString(),
      id: completeMeal.id,
      user: userId,
      date: completeMeal.date,
      lunch: {
        recipe: completeMeal.lunch_recipe
          ? {
              _id: completeMeal.lunch_recipe.id.toString(),
              id: completeMeal.lunch_recipe.id,
              name: completeMeal.lunch_recipe.name,
            }
          : null,
        ingredients:
          lunchIngredients?.map((li) => ({
            _id: li.ingredient.id.toString(),
            id: li.ingredient.id,
            name: li.ingredient.name,
            category: li.ingredient.category,
          })) || [],
      },
      dinner: {
        recipe: completeMeal.dinner_recipe
          ? {
              _id: completeMeal.dinner_recipe.id.toString(),
              id: completeMeal.dinner_recipe.id,
              name: completeMeal.dinner_recipe.name,
            }
          : null,
        ingredients:
          dinnerIngredients?.map((di) => ({
            _id: di.ingredient.id.toString(),
            id: di.ingredient.id,
            name: di.ingredient.name,
            category: di.ingredient.category,
          })) || [],
      },
      created_at: completeMeal.created_at,
      updated_at: completeMeal.updated_at,
    };

    console.log("Saved meal:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("Error creating/updating daily meal:", error);
    res.status(500).json({ message: error.message });
  }
};
