const mongoose = require("mongoose");
const Ingredient = require("../models/ingredient.model");
require("dotenv").config();

const ingredients = [
  { name: "Blanc de poulet", category: "Viande" },
  { name: "Pate de poulet", category: "Viande" },
  { name: "Steak", category: "Viande" },
  { name: "Poulet entier", category: "Viande" },
  { name: "steak haché", category: "Viande" },
  { name: "Jambon", category: "Viande" },
  { name: "saucisse Knacki", category: "Viande" },
  { name: "Saucisse porc", category: "Viande" },
  { name: "Merguez", category: "Viande" },
  { name: "Brochette", category: "Viande" },
  { name: "Agneau", category: "Viande" },
  { name: "Cotes de porc", category: "Viande" },
  { name: "Nuggets", category: "Viande" },
  { name: "Lardons", category: "Viande" },
  { name: "Gigot", category: "Viande" },
  { name: "Dinde", category: "Viande" },
  { name: "canard", category: "Viande" },
  { name: "lapin", category: "Viande" },
  { name: "sanglier", category: "Viande" },
  { name: "Entrecote", category: "Viande" },
  { name: "bavette", category: "Viande" },
  { name: "Saumon", category: "Poisson" },
  { name: "Thon", category: "Poisson" },
  { name: "Cabillaud", category: "Poisson" },
  { name: "sole", category: "Poisson" },
  { name: "Maquereau", category: "Poisson" },
  { name: "Sardine", category: "Poisson" },
  { name: "Hareng", category: "Poisson" },
  { name: "Dorade", category: "Poisson" },
  { name: "Colin", category: "Poisson" },
  { name: "Truite", category: "Poisson" },
  { name: "Limande", category: "Poisson" },
  { name: "Bœuf", category: "Viande" },
  { name: "Viande hachée", category: "Viande" },
  { name: "Œufs", category: "Autre" },
  { name: "Saucisse fumé", category: "Viande" },
  { name: "Cordon bleu", category: "Viande" },
  { name: "Chorizo", category: "Viande" },
  { name: "Carotte", category: "Légume" },
  { name: "Brocoli", category: "Légume" },
  { name: "Tomate", category: "Légume" },
  { name: "Concombre", category: "Légume" },
  { name: "Haricot vert", category: "Légume" },
  { name: "Courgette", category: "Légume" },
  { name: "Petit pois", category: "Légume" },
  { name: "Endive", category: "Légume" },
  { name: "Poivron", category: "Légume" },
  { name: "Poireau", category: "Légume" },
  { name: "Aubergine", category: "Légume" },
  { name: "Navet", category: "Légume" },
  { name: "Salade", category: "Légume" },
  { name: "Radis", category: "Légume" },
  { name: "Épinard", category: "Légume" },
  { name: "Chou", category: "Légume" },
  { name: "Riz", category: "Féculent" },
  { name: "Pâtes", category: "Féculent" },
  { name: "Pomme de terre", category: "Féculent" },
  { name: "patate douce", category: "Féculent" },
  { name: "Semoule de blé", category: "Féculent" },
  { name: "Boulgour", category: "Féculent" },
  { name: "Quinoa", category: "Féculent" },
  { name: "Ebly", category: "Féculent" },
  { name: "Lentilles", category: "Féculent" },
  { name: "Pois chiches", category: "Féculent" },
  { name: "Flocon avoine", category: "Féculent" },
  { name: "pate feuilleté", category: "Pâte" },
  { name: "pate brisée", category: "Pâte" },
  { name: "oignon", category: "Légume" },
  { name: "Sauce bolognaise", category: "Sauce" },
  { name: "Crème fraiche", category: "Sauce" },
  { name: "Frites", category: "Féculent" },
  { name: "Taboulé", category: "Autre" },
  { name: "Flageolet", category: "Féculent" },
  { name: "Maïs", category: "Légume" },
  { name: "Pain de mie", category: "Pain" },
  { name: "Pain hotdog", category: "Pain" },
  { name: "Cheddar", category: "Fromages" },
  { name: "Emmental", category: "Fromages" },
  { name: "Pain burger", category: "Pain" },
  { name: "Mozarella", category: "Fromages" },
  { name: "Buratta", category: "Fromages" },
  { name: "Macédoine", category: "Autre" },
  { name: "pomme dauphine", category: "Féculent" },
  { name: "croissant", category: "Autre" },
  { name: "gruyères", category: "Fromages" },
  { name: "Kiri", category: "Fromages" },
];
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log("Cleared existing ingredients");

    // Insert new ingredients
    await Ingredient.insertMany(ingredients);
    console.log("Seeded ingredients successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
