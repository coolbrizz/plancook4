import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface Recipe {
  _id: string;
  name: string;
  ingredients: {
    _id: string;
    name: string;
    category: string;
  }[];
}

export default function RecipesScreen() {
  const { data: recipes, fetchData } = useApi<Recipe[]>(endpoints.recipes);

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("Error fetching recipes:", err);
    });
  }, [fetchData]);
  console.log(recipes);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "/recipe/add_recipe",
            })
          }
        >
          <Ionicons name="add-circle" size={24} color="#556942" />
          <Text style={styles.addButtonText}>Ajouter une recette</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "/recipe/addIngredients",
            })
          }
        >
          <Ionicons name="add-circle" size={24} color="#556942" />
          <Text style={styles.addButtonText}>Ajouter un ingrédient</Text>
        </TouchableOpacity>
      </View>
      {recipes?.map((recipe, index) => (
        <TouchableOpacity
          key={recipe._id || `recipe-${index}`}
          style={styles.recipeCard}
          onPress={() =>
            router.push({
              pathname: "/recipe/modify_recipe",
              params: { id: recipe._id },
            })
          }
        >
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.ingredients}>
            {recipe.ingredients.map((ing) => ing.name).join(", ")}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#A1CEDC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  recipeCard: {
    backgroundColor: "#F8F6EE",
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ingredients: {
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F6EE",
    margin: 8,
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  addButtonText: {
    marginLeft: 12,
    color: "#80322D",
    fontWeight: "bold",
  },
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});
