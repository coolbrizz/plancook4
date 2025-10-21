const { supabase } = require("../config/supabase");

// Get all recipes with their ingredients
exports.getRecipes = async (req, res) => {
  try {
    const { data: recipes, error } = await supabase.from("recipes").select(`
        id,
        name,
        created_at,
        updated_at,
        ingredients:recipe_ingredients(
          ingredient:ingredients(
            id,
            name,
            category
          )
        )
      `);

    if (error) throw error;

    // Transform data to match old MongoDB format
    const transformedRecipes = recipes.map((recipe) => ({
      _id: recipe.id.toString(),
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.map((ri) => ({
        _id: ri.ingredient.id.toString(),
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        category: ri.ingredient.category,
      })),
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    }));

    // If no recipes exist, create test data
    if (transformedRecipes.length === 0) {
      const testRecipes = [
        { name: "Pâtes à la bolognaise" },
        { name: "Omelette aux légumes" },
      ];

      const { data: savedRecipes, error: insertError } = await supabase
        .from("recipes")
        .insert(testRecipes)
        .select();

      if (insertError) throw insertError;

      return res.json(
        savedRecipes.map((r) => ({
          _id: r.id.toString(),
          ...r,
          ingredients: [],
        }))
      );
    }

    res.json(transformedRecipes);
  } catch (error) {
    console.error("Error getting recipes:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get recipe by ID
exports.getRecipe = async (req, res) => {
  try {
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select(
        `
        id,
        name,
        created_at,
        updated_at,
        ingredients:recipe_ingredients(
          ingredient:ingredients(
            id,
            name,
            category
          )
        )
      `
      )
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Recipe not found" });
      }
      throw error;
    }

    // Transform data
    const transformedRecipe = {
      _id: recipe.id.toString(),
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.map((ri) => ({
        _id: ri.ingredient.id.toString(),
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        category: ri.ingredient.category,
      })),
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    };

    res.status(200).json(transformedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { name, ingredients } = req.body;

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({ name })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert recipe-ingredient links if provided
    if (ingredients && ingredients.length > 0) {
      const recipeIngredients = ingredients.map((ingredientId) => ({
        recipe_id: recipe.id,
        ingredient_id: ingredientId,
      }));

      const { error: linkError } = await supabase
        .from("recipe_ingredients")
        .insert(recipeIngredients);

      if (linkError) throw linkError;
    }

    // Fetch complete recipe with ingredients
    const { data: completeRecipe } = await supabase
      .from("recipes")
      .select(
        `
        id,
        name,
        created_at,
        updated_at,
        ingredients:recipe_ingredients(
          ingredient:ingredients(
            id,
            name,
            category
          )
        )
      `
      )
      .eq("id", recipe.id)
      .single();

    const transformedRecipe = {
      _id: completeRecipe.id.toString(),
      id: completeRecipe.id,
      name: completeRecipe.name,
      ingredients: completeRecipe.ingredients.map((ri) => ({
        _id: ri.ingredient.id.toString(),
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        category: ri.ingredient.category,
      })),
      created_at: completeRecipe.created_at,
      updated_at: completeRecipe.updated_at,
    };

    res.status(201).json(transformedRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update recipe
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ingredients } = req.body;

    // Update recipe name
    const { data: recipe, error: updateError } = await supabase
      .from("recipes")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return res.status(404).json({ message: "Recipe not found" });
      }
      throw updateError;
    }

    // Update ingredients if provided
    if (ingredients !== undefined) {
      // Delete existing links
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);

      // Insert new links
      if (ingredients.length > 0) {
        const recipeIngredients = ingredients.map((ingredientId) => ({
          recipe_id: id,
          ingredient_id: ingredientId,
        }));

        const { error: linkError } = await supabase
          .from("recipe_ingredients")
          .insert(recipeIngredients);

        if (linkError) throw linkError;
      }
    }

    // Fetch complete recipe with ingredients
    const { data: completeRecipe } = await supabase
      .from("recipes")
      .select(
        `
        id,
        name,
        created_at,
        updated_at,
        ingredients:recipe_ingredients(
          ingredient:ingredients(
            id,
            name,
            category
          )
        )
      `
      )
      .eq("id", id)
      .single();

    const transformedRecipe = {
      _id: completeRecipe.id.toString(),
      id: completeRecipe.id,
      name: completeRecipe.name,
      ingredients: completeRecipe.ingredients.map((ri) => ({
        _id: ri.ingredient.id.toString(),
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        category: ri.ingredient.category,
      })),
      created_at: completeRecipe.created_at,
      updated_at: completeRecipe.updated_at,
    };

    res.json(transformedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete recipe (cascade will handle recipe_ingredients)
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: error.message });
  }
};
