// API URL from environment variable or fallback to localhost
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://plancook4-2.onrender.com";

export const endpoints = {
  baseUrl: API_URL,
  recipes: "/api/recipes",
  ingredients: "/api/ingredients",
  meals: "/api/daily-meals",
  users: "/api/users",
};
