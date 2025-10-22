import SelectionModal from "@/components/SelectionModal";
import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Menu } from "react-native-paper";

const CATEGORIES = [
  "Viande",
  "Légume",
  "Féculent",
  "Pain",
  "Fromages",
  "Sauces",
  "Pâte",
  "Autre",
] as const;

interface Ingredient {
  _id: string;
  name: string;
  category: string;
}

export default function AddIngredients() {
  const [ingredientName, setIngredientName] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0]
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const { data: existingIngredients, fetchData: fetchIngredients } = useApi<
    Ingredient[]
  >(endpoints.ingredients);
  const { fetchData: saveIngredient } = useApi(endpoints.ingredients);
  const [modalVisible, setModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    fetchIngredients().catch((err) => {
      console.error("Error fetching ingredients:", err);
    });
  }, [fetchIngredients]);

  const getDisplayCategory = (cat: string) => {
    return cat;
  };

  const handleSave = async () => {
    if (!ingredientName.trim()) {
      alert("Veuillez entrer un nom d'ingrédient");
      return;
    }

    if (
      existingIngredients?.some(
        (ing: Ingredient) =>
          ing.name.toLowerCase() === ingredientName.toLowerCase()
      )
    ) {
      alert("Cet ingrédient existe déjà");
      return;
    }

    try {
      await saveIngredient("POST", {
        name: ingredientName,
        category,
      });
      router.replace("/recipes");
    } catch (error) {
      console.error("Error saving ingredient:", error);
      alert("Erreur lors de l'enregistrement de l'ingrédient");
    }
  };

  const handleSelect = (selectedIngredient: Ingredient) => {
    setIngredients([selectedIngredient]);
    setModalVisible(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Nouvel Ingrédient",
          headerStyle: {
            backgroundColor: "#F8F6EE",
          },
          headerTintColor: "#556942",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'ingrédient"
            value={ingredientName}
            onChangeText={setIngredientName}
          />

          <Text style={styles.subtitle}>Catégorie :</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.categoryButton}
              >
                {getDisplayCategory(category)}
              </Button>
            }
          >
            {CATEGORIES.map((cat) => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setMenuVisible(false);
                }}
                title={getDisplayCategory(cat)}
              />
            ))}
          </Menu>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Enregistrer l&apos;ingrédient
          </Button>

          <SelectionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSelect={handleSelect}
            data={ingredients || []}
            title="Sélectionner un ingrédient"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6EE",
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
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#E8E5D9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  categoryButton: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
});
