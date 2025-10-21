import SelectionModal from "@/components/SelectionModal";
import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

interface Ingredient {
  _id: string;
  name: string;
}

interface Recipe {
  _id: string;
  name: string;
  ingredients: Ingredient[];
}

export default function ModifyRecipe() {
  const { id } = useLocalSearchParams();
  const [recipeName, setRecipeName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [isIngredientModalVisible, setIsIngredientModalVisible] =
    useState(false);

  const { data: recipe, fetchData: fetchRecipe } = useApi<Recipe>(
    `${endpoints.recipes}/${id}`
  );
  const { data: ingredients, fetchData: fetchIngredients } = useApi<
    Ingredient[]
  >(endpoints.ingredients);
  const { fetchData: updateRecipe } = useApi(`${endpoints.recipes}/${id}`);

  useEffect(() => {
    fetchRecipe().catch((err) => {
      console.error("Error fetching recipe:", err);
    });
    fetchIngredients().catch((err) => {
      console.error("Error fetching ingredients:", err);
    });
  }, [fetchRecipe, fetchIngredients]);

  useEffect(() => {
    if (recipe) {
      setRecipeName(recipe.name);
      setSelectedIngredients(recipe.ingredients);
    }
  }, [recipe]);

  const handleSave = async () => {
    if (!recipeName.trim()) {
      alert("Veuillez entrer un nom de recette");
      return;
    }

    if (selectedIngredients.length === 0) {
      alert("Veuillez sélectionner au moins un ingrédient");
      return;
    }

    try {
      await updateRecipe("PUT", {
        name: recipeName,
        ingredients: selectedIngredients.map((ing) => ing._id),
      });
      router.replace("/recipes");
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Erreur lors de la modification de la recette");
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.some((ing) => ing._id === ingredient._id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIsIngredientModalVisible(false);
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(
      selectedIngredients.filter((ing) => ing._id !== ingredientId)
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Modifier la Recette",
          headerStyle: {
            backgroundColor: "#A1CEDC",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Nom de la recette"
            value={recipeName}
            onChangeText={setRecipeName}
          />

          <Text style={styles.subtitle}>Ingrédients :</Text>
          <Button
            mode="outlined"
            onPress={() => setIsIngredientModalVisible(true)}
            style={styles.addButton}
          >
            Ajouter un ingrédient
          </Button>

          <View style={styles.ingredientsList}>
            {selectedIngredients.map((ingredient) => (
              <View key={ingredient._id} style={styles.ingredientItem}>
                <Text>{ingredient.name}</Text>
                <TouchableOpacity
                  onPress={() => removeIngredient(ingredient._id)}
                >
                  <Text style={styles.removeButton}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Enregistrer les modifications
          </Button>
        </View>

        <SelectionModal
          visible={isIngredientModalVisible}
          onClose={() => setIsIngredientModalVisible(false)}
          onSelect={handleSelectIngredient}
          data={ingredients || []}
          title="Sélectionner un ingrédient"
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    marginBottom: 15,
  },
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    fontSize: 24,
    color: "#ff4444",
    paddingHorizontal: 8,
  },
  saveButton: {
    marginTop: 20,
  },
});
