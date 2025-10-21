const { supabase } = require("../config/supabase");

const testIngredients = [
  { name: "Poulet", category: "Viande" },
  { name: "Riz", category: "Féculent" },
  { name: "Carotte", category: "Légume" },
  { name: "Oignon", category: "Légume" },
  { name: "Tomate", category: "Légume" },
];

// Create new ingredient
exports.createIngredient = async (req, res) => {
  try {
    const { name, category } = req.body;

    const { data, error } = await supabase
      .from("ingredients")
      .insert({ name, category })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ _id: data.id.toString(), ...data });
  } catch (error) {
    console.error("Error in createIngredient:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all ingredients
exports.getIngredients = async (req, res) => {
  try {
    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    // If no ingredients exist, create test data
    if (ingredients.length === 0) {
      const { data: savedIngredients, error: insertError } = await supabase
        .from("ingredients")
        .insert(testIngredients)
        .select();

      if (insertError) throw insertError;

      return res.json(
        savedIngredients.map((i) => ({ _id: i.id.toString(), ...i }))
      );
    }

    res.json(ingredients.map((i) => ({ _id: i.id.toString(), ...i })));
  } catch (error) {
    console.error("Error getting ingredients:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get ingredient by ID
exports.getIngredient = async (req, res) => {
  try {
    const { data: ingredient, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      throw error;
    }

    res.status(200).json({ _id: ingredient.id.toString(), ...ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const { data: ingredient, error } = await supabase
      .from("ingredients")
      .update({ name, category })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      throw error;
    }

    res.status(200).json({ _id: ingredient.id.toString(), ...ingredient });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("ingredients").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Ingredient deleted" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    res.status(500).json({ message: error.message });
  }
};
