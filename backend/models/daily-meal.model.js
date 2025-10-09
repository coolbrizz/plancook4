const mongoose = require("mongoose");

const dailyMealSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    lunch: {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        default: null,
        index: true,
      },
      ingredients: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          index: true,
        },
      ],
    },
    dinner: {
      recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        default: null,
        index: true,
      },
      ingredients: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          index: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

dailyMealSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("DailyMeal", dailyMealSchema);
