import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import SelectionModal from "../components/SelectionModal";

export interface Recipe {
  _id: string;
  name: string;
  ingredients?: { name: string }[];
}

export interface Ingredient {
  _id: string;
  name: string;
}

export interface DailyMeal {
  _id: string;
  date: string;
  lunch: {
    recipe: { _id: string; name: string } | null;
    ingredients: { _id: string; name: string }[];
  };
  dinner: {
    recipe: { _id: string; name: string } | null;
    ingredients: { _id: string; name: string }[];
  };
}

export default function EditMealScreen() {
  const { mealId, date } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: recipes, fetchData } = useApi<Recipe[]>(endpoints.recipes);
  const { data: ingredients, fetchData: fetchIngredients } = useApi<
    Ingredient[]
  >(endpoints.ingredients);
  const { fetchData: saveMeal } = useApi<DailyMeal>(endpoints.meals);
  const { data: existingMeals, fetchData: fetchMeals } = useApi<DailyMeal[]>(
    endpoints.meals
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"recipes" | "ingredients">(
    "recipes"
  );
  const [selectedMealType, setSelectedMealType] = useState<
    "lunch" | "dinner" | null
  >(null);
  const [selectedLunchRecipe, setSelectedLunchRecipe] = useState<Recipe | null>(
    null
  );
  const [selectedLunchIngredients, setSelectedLunchIngredients] = useState<
    Ingredient[]
  >([]);
  const [selectedDinnerRecipe, setSelectedDinnerRecipe] =
    useState<Recipe | null>(null);
  const [selectedDinnerIngredients, setSelectedDinnerIngredients] = useState<
    Ingredient[]
  >([]);

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("Error fetching recipes:", err);
    });
    fetchIngredients().catch((err) => {
      console.error("Error fetching ingredients:", err);
    });
    fetchMeals().catch((err) => {
      console.error("Error fetching meals:", err);
    });
  }, [fetchData, fetchIngredients, fetchMeals]);

  // Load existing meal data
  useEffect(() => {
    if (existingMeals && mealId) {
      const meal = existingMeals.find((m) => m._id === mealId);
      if (meal) {
        if (meal.lunch.recipe) {
          setSelectedLunchRecipe({
            _id: meal.lunch.recipe._id,
            name: meal.lunch.recipe.name,
          });
        }
        if (meal.lunch.ingredients) {
          setSelectedLunchIngredients(meal.lunch.ingredients);
        }
        if (meal.dinner.recipe) {
          setSelectedDinnerRecipe({
            _id: meal.dinner.recipe._id,
            name: meal.dinner.recipe.name,
          });
        }
        if (meal.dinner.ingredients) {
          setSelectedDinnerIngredients(meal.dinner.ingredients);
        }
      }
    }
  }, [existingMeals, mealId]);

  const handleSelect = (item: Recipe | Ingredient) => {
    if (modalType === "recipes") {
      if (selectedMealType === "lunch") {
        setSelectedLunchRecipe(item as Recipe);
      } else {
        setSelectedDinnerRecipe(item as Recipe);
      }
    } else if (modalType === "ingredients") {
      if (selectedMealType === "lunch") {
        if (selectedLunchIngredients.length < 4) {
          setSelectedLunchIngredients([
            ...selectedLunchIngredients,
            item as Ingredient,
          ]);
        }
      } else {
        if (selectedDinnerIngredients.length < 4) {
          setSelectedDinnerIngredients([
            ...selectedDinnerIngredients,
            item as Ingredient,
          ]);
        }
      }
    }
    setModalVisible(false);
  };

  const removeDinnerIngredient = (index: number) => {
    setSelectedDinnerIngredients(
      selectedDinnerIngredients.filter((_, i) => i !== index)
    );
  };

  const removeLunchIngredient = (index: number) => {
    setSelectedLunchIngredients(
      selectedLunchIngredients.filter((_, i) => i !== index)
    );
  };

  const removeDinnerRecipe = () => {
    setSelectedDinnerRecipe(null);
  };

  const removeLunchRecipe = () => {
    setSelectedLunchRecipe(null);
  };

  const renderRecipeItem = (item: Recipe | Ingredient) => {
    if ("ingredients" in item) {
      return (
        <>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeIngredients}>
            {item.ingredients?.map((i) => i.name).join(", ")}
          </Text>
        </>
      );
    }
    return <Text style={styles.recipeName}>{item.name}</Text>;
  };

  const handleSave = async () => {
    try {
      const mealData = {
        user: user?.id,
        date: date as string,
        lunch: {
          recipe: selectedLunchRecipe?._id || null,
          ingredients: selectedLunchIngredients.map((i) => i._id),
        },
        dinner: {
          recipe: selectedDinnerRecipe?._id || null,
          ingredients: selectedDinnerIngredients.map((i) => i._id),
        },
      };
      await saveMeal("POST", mealData);
      router.replace("/");
    } catch (error) {
      console.error("Error saving meal:", error);
      alert(
        "Erreur lors de l'enregistrement du repas. Vérifiez que vous êtes bien connecté."
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Selectionnez vos repas`,
          headerStyle: {
            backgroundColor: "#556942",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView style={styles.container}>
        {/* Repas du midi */}
        <View style={styles.mealSection} key={selectedLunchRecipe?._id}>
          <Text style={styles.sectionTitle}>Repas du midi</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedMealType("lunch");
              setModalType("recipes");
              setModalVisible(true);
            }}
            style={styles.mealInput}
          >
            <Text style={styles.mealInputText}>
              {selectedLunchRecipe?.name || "Sélectionner une recette"}
            </Text>
          </TouchableOpacity>

          {selectedLunchRecipe && (
            <Button
              mode="outlined"
              onPress={removeLunchRecipe}
              style={styles.removeButton}
            >
              Supprimer la recette
            </Button>
          )}

          <TouchableOpacity
            onPress={() => {
              setSelectedMealType("lunch");
              setModalType("ingredients");
              setModalVisible(true);
            }}
            style={styles.mealInput}
          >
            <Text style={styles.mealInputText}>
              {selectedLunchIngredients.length > 0
                ? `${selectedLunchIngredients.length} ingrédient(s) sélectionné(s)`
                : "Ajouter des ingrédients"}
            </Text>
          </TouchableOpacity>

          {selectedLunchIngredients.map((ingredient, index) => (
            <View key={ingredient._id} style={styles.ingredientItem}>
              <Text>{ingredient.name}</Text>
              <Button
                mode="text"
                onPress={() => removeLunchIngredient(index)}
                style={styles.removeIngredientButton}
              >
                Supprimer
              </Button>
            </View>
          ))}
        </View>

        {/* Repas du soir */}
        <View style={styles.mealSection} key={selectedDinnerRecipe?._id}>
          <Text style={styles.sectionTitle}>Repas du soir</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedMealType("dinner");
              setModalType("recipes");
              setModalVisible(true);
            }}
            style={styles.mealInput}
          >
            <Text style={styles.mealInputText}>
              {selectedDinnerRecipe?.name || "Sélectionner une recette"}
            </Text>
          </TouchableOpacity>

          {selectedDinnerRecipe && (
            <Button
              mode="outlined"
              onPress={removeDinnerRecipe}
              style={styles.removeButton}
            >
              Supprimer la recette
            </Button>
          )}

          <TouchableOpacity
            onPress={() => {
              setSelectedMealType("dinner");
              setModalType("ingredients");
              setModalVisible(true);
            }}
            style={styles.mealInput}
          >
            <Text style={styles.mealInputText}>
              {selectedDinnerIngredients.length > 0
                ? `${selectedDinnerIngredients.length} ingrédient(s) sélectionné(s)`
                : "Ajouter des ingrédients"}
            </Text>
          </TouchableOpacity>

          {selectedDinnerIngredients.map((ingredient, index) => (
            <View key={ingredient._id} style={styles.ingredientItem}>
              <Text>{ingredient.name}</Text>
              <Button
                mode="text"
                onPress={() => removeDinnerIngredient(index)}
                style={styles.removeIngredientButton}
              >
                Supprimer
              </Button>
            </View>
          ))}
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Enregistrer
        </Button>
      </ScrollView>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelect}
        data={modalType === "recipes" ? recipes || [] : ingredients || []}
        title={
          modalType === "recipes"
            ? "Sélectionner une recette"
            : "Sélectionner des ingrédients"
        }
        renderItem={modalType === "recipes" ? renderRecipeItem : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F6EE",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  mealSection: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  mealInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  mealInputText: {
    fontSize: 16,
    color: "#666",
  },
  removeButton: {
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  removeIngredientButton: {
    marginLeft: 8,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: "#556942",
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  recipeIngredients: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
