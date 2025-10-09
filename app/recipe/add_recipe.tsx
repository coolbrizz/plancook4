import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";
import SelectionModal from "../../components/SelectionModal";

interface Ingredient {
  _id: string;
  name: string;
}

interface Recipe {
  _id: string;
  name: string;
  ingredients: string[];
}

export default function AddRecipe() {
  const [recipeName, setRecipeName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const { data: ingredients, fetchData } = useApi<Ingredient[]>(
    endpoints.ingredients
  );
  const { data: existingRecipes, fetchData: fetchRecipes } = useApi<Recipe[]>(
    endpoints.recipes
  );
  const { fetchData: saveRecipe } = useApi(endpoints.recipes);

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("Error fetching ingredients:", err);
    });
    fetchRecipes().catch((err) => {
      console.error("Error fetching recipes:", err);
    });
  }, [fetchData, fetchRecipes]);

  const handleAddIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.find((i) => i._id === ingredient._id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!recipeName.trim()) {
      alert("Veuillez entrer un nom de recette");
      return;
    }

    if (
      existingRecipes?.some(
        (recipe) => recipe.name.toLowerCase() === recipeName.toLowerCase()
      )
    ) {
      alert("Une recette avec ce nom existe déjà");
      return;
    }

    try {
      await saveRecipe("POST", {
        name: recipeName,
        ingredients: selectedIngredients.map((i) => i._id),
      });
      router.replace("/recipes");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Erreur lors de l'enregistrement de la recette");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nouvelle Recette</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom de la recette"
          value={recipeName}
          onChangeText={setRecipeName}
        />

        <Button
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          Ajouter des ingrédients
        </Button>

        {selectedIngredients.length > 0 && (
          <View style={styles.ingredientsList}>
            <Text style={styles.subtitle}>Ingrédients sélectionnés :</Text>
            {selectedIngredients.map((ingredient) => (
              <View key={ingredient._id} style={styles.ingredientItem}>
                <Text>{ingredient.name}</Text>
                <Button
                  onPress={() =>
                    setSelectedIngredients((ingredients) =>
                      ingredients.filter((i) => i._id !== ingredient._id)
                    )
                  }
                  mode="text"
                >
                  ×
                </Button>
              </View>
            ))}
          </View>
        )}

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Enregistrer la recette
        </Button>
      </View>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAddIngredient}
        data={ingredients || []}
        title="Sélectionner des ingrédients"
      />
    </ScrollView>
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
  addButton: {
    marginBottom: 20,
    backgroundColor: "#A1CEDC",
  },
  ingredientsList: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
});
