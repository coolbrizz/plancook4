const DailyMeal = require("../models/daily-meal.model");

// Get all daily meals for a specific user
exports.getDailyMeals = async (req, res) => {
  try {
    // Clean up old meals first
    await cleanupOldMeals(req.user._id);

    const dailyMeals = await DailyMeal.find({ user: req.user._id })
      .populate("lunch.recipe")
      .populate("lunch.ingredients")
      .populate("dinner.recipe")
      .populate("dinner.ingredients");
    // If no meals exist, create test data
    if (dailyMeals.length === 0) {
      const today = new Date();
      const testMeal = new DailyMeal({
        user: req.user._id,
        date: today,
        lunch: {
          recipe: null,
          ingredients: [],
        },
        dinner: {
          recipe: null,
          ingredients: [],
        },
      });
      await testMeal.save();
      return res.json([testMeal]);
    }

    res.json(dailyMeals);
  } catch (error) {
    console.error("Error getting daily meals:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cleanup function to delete meals older than 3 days
async function cleanupOldMeals(userId) {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await DailyMeal.deleteMany({
      user: userId,
      date: { $lt: threeDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(
        `Deleted ${result.deletedCount} old meals for user ${userId}`
      );
    }
  } catch (error) {
    console.error("Error cleaning up old meals:", error);
  }
}

// Create or update a daily meal
exports.createDailyMeal = async (req, res) => {
  try {
    const { date, lunch, dinner } = req.body;
    console.log("Creating/updating meal for user:", req.user._id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Normalize the date to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Check if a meal already exists for this date and user
    const existingMeal = await DailyMeal.findOne({
      user: req.user._id,
      date: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    let meal;
    if (existingMeal) {
      // Update existing meal
      meal = await DailyMeal.findByIdAndUpdate(
        existingMeal._id,
        {
          lunch: {
            recipe: lunch.recipe || null,
            ingredients: lunch.ingredients || [],
          },
          dinner: {
            recipe: dinner.recipe || null,
            ingredients: dinner.ingredients || [],
          },
        },
        { new: true }
      );
    } else {
      // Create new meal
      meal = new DailyMeal({
        user: req.user._id,
        date: normalizedDate,
        lunch: {
          recipe: lunch.recipe || null,
          ingredients: lunch.ingredients || [],
        },
        dinner: {
          recipe: dinner.recipe || null,
          ingredients: dinner.ingredients || [],
        },
      });
      await meal.save();
    }

    // Populate the references
    const populatedMeal = await DailyMeal.findById(meal._id)
      .populate("lunch.recipe")
      .populate("lunch.ingredients")
      .populate("dinner.recipe")
      .populate("dinner.ingredients");

    console.log("Saved meal:", JSON.stringify(populatedMeal, null, 2));
    res.json(populatedMeal);
  } catch (error) {
    console.error("Error creating/updating daily meal:", error);
    res.status(500).json({ message: error.message });
  }
};
