const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Viande",
        "Légume",
        "Féculent",
        "Pain",
        "Poisson",
        "Fromages",
        "Sauce",
        "Pâte",
        "Autre",
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ingredient", ingredientSchema);
