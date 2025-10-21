import { endpoints } from "@/config/api";
import { useApi } from "@/hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";

interface DailyMeal {
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

export default function HomeScreen() {
  const { session, logout } = useAuth();
  const {
    data: dailyMeals,
    fetchData,
    loading,
  } = useApi<DailyMeal[]>(endpoints.meals);
  const { fetchData: addDay, loading: isAdding } = useApi(endpoints.meals);

  // Charger les données quand l'écran est affiché
  useFocusEffect(
    React.useCallback(() => {
      if (session?.access_token) {
        console.log("Loading meals...");
        fetchData()
          .then((data) => {
            console.log("Fetched data:", data);
          })
          .catch((err) => {
            console.error("Error fetching dailyMeal:", err);
          });
      }
    }, [session?.access_token, fetchData])
  );

  const handleAddDay = async () => {
    if (isAdding) return; // Empêche les clics multiples

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = dailyMeals?.length
        ? new Date(
            Math.max(...dailyMeals.map((meal) => new Date(meal.date).getTime()))
          )
        : today;

      const newDate = new Date(lastDate);
      newDate.setDate(newDate.getDate() + 1);

      await addDay("POST", {
        date: newDate.toISOString(),
        lunch: { recipe: null, ingredients: [] },
        dinner: { recipe: null, ingredients: [] },
      });

      await fetchData();
    } catch (error) {
      alert(error || "Erreur lors de l'ajout de la journée");
    }
  };

  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Planning repas de la semaine</Text>
        <Button
          onPress={async () => {
            try {
              await logout();
              router.replace("/auth/signin");
            } catch (error) {
              console.error("Erreur lors de la déconnexion:", error);
              alert("Erreur lors de la déconnexion. Veuillez réessayer.");
            }
          }}
          mode="text"
          style={{ padding: 0 }}
        >
          <Ionicons name="log-out-outline" size={26} color={"black"} />
        </Button>
      </View>

      <View style={styles.weekContainer}>
        {loading && !dailyMeals ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : dailyMeals && dailyMeals.length === 0 ? (
          <Text style={styles.emptyText}>
            Aucun repas planifié. Ajoutez une journée !
          </Text>
        ) : null}
        {dailyMeals?.map((meal) => {
          const date = new Date(meal.date);
          const formattedDate = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });

          return (
            <View key={meal._id} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{formattedDate}</Text>
              <Button
                mode="contained"
                onPress={() =>
                  router.push({
                    pathname: "/edit-meal",
                    params: {
                      mealId: meal._id,
                      date: meal.date,
                    },
                  })
                }
                style={styles.modifButton}
                labelStyle={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "rgb(11, 113, 147)",
                }}
              >
                Modifier les repas
              </Button>
              <View style={styles.mealContainer}>
                <View style={styles.mealBox}>
                  <Text style={styles.mealTitle}>Midi :</Text>
                  <Text>{meal.lunch?.recipe?.name}</Text>
                  <Text>
                    {meal.lunch?.ingredients
                      ?.map((ingredient) => ingredient.name)
                      .join(", ") || ""}
                  </Text>
                </View>
                <View style={styles.mealBox}>
                  <Text style={styles.mealTitle}>Soir :</Text>
                  <Text>{meal.dinner?.recipe?.name}</Text>
                  <Text>
                    {meal.dinner?.ingredients
                      ?.map((ingredient) => ingredient.name)
                      .join(", ") || ""}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        mode="contained"
        onPress={handleAddDay}
        disabled={isAdding || loading}
        loading={isAdding}
        style={styles.addButton}
        icon={() => <Ionicons name="add-circle" size={24} color="white" />}
      >
        Ajouter une journée
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#A1CEDC",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  weekContainer: {
    padding: 16,
    gap: 16,
  },
  dayContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 18,
    marginBottom: 14,
    fontWeight: "600",
  },
  mealContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  mealBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  mealTitle: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  addButton: {
    margin: 16,
    backgroundColor: "#A1CEDC",
  },
  modifButton: {
    position: "absolute",
    top: 4,
    right: 16,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: "rgb(211, 244, 255)",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
