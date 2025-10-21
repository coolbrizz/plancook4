-- =====================================================
-- PLANCOOK - Schema Supabase PostgreSQL
-- =====================================================
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Table Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'Viande', 'Légume', 'Féculent', 'Pain', 
    'Poisson', 'Fromages', 'Sauce', 'Pâte', 'Autre'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de jointure Recipe-Ingredient
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Table Daily Meals
CREATE TABLE IF NOT EXISTS daily_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Lunch
  lunch_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  
  -- Dinner
  dinner_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Table de jointure DailyMeal Lunch Ingredients
CREATE TABLE IF NOT EXISTS daily_meal_lunch_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_meal_id UUID NOT NULL REFERENCES daily_meals(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_meal_id, ingredient_id)
);

-- Table de jointure DailyMeal Dinner Ingredients
CREATE TABLE IF NOT EXISTS daily_meal_dinner_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_meal_id UUID NOT NULL REFERENCES daily_meals(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_meal_id, ingredient_id)
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_meals_user_date ON daily_meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_meals_date ON daily_meals(date);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_daily_meal_lunch_ingredients_meal ON daily_meal_lunch_ingredients(daily_meal_id);
CREATE INDEX IF NOT EXISTS idx_daily_meal_dinner_ingredients_meal ON daily_meal_dinner_ingredients(daily_meal_id);

-- =====================================================
-- 3. TRIGGERS pour updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_meals_updated_at
  BEFORE UPDATE ON daily_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meal_lunch_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meal_dinner_ingredients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES - Ingredients (lecture publique, écriture authentifiée)
-- =====================================================

CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ingredients"
  ON ingredients FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ingredients"
  ON ingredients FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- POLICIES - Recipes (lecture publique, écriture authentifiée)
-- =====================================================

CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update recipes"
  ON recipes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete recipes"
  ON recipes FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- POLICIES - Recipe Ingredients
-- =====================================================

CREATE POLICY "Recipe ingredients are viewable by everyone"
  ON recipe_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage recipe ingredients"
  ON recipe_ingredients FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- POLICIES - Daily Meals (chaque user voit uniquement ses repas)
-- =====================================================

CREATE POLICY "Users can view their own daily meals"
  ON daily_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily meals"
  ON daily_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily meals"
  ON daily_meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily meals"
  ON daily_meals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - Daily Meal Lunch Ingredients
-- =====================================================

CREATE POLICY "Users can view their lunch ingredients"
  ON daily_meal_lunch_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_meals
      WHERE daily_meals.id = daily_meal_lunch_ingredients.daily_meal_id
      AND daily_meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their lunch ingredients"
  ON daily_meal_lunch_ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_meals
      WHERE daily_meals.id = daily_meal_lunch_ingredients.daily_meal_id
      AND daily_meals.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES - Daily Meal Dinner Ingredients
-- =====================================================

CREATE POLICY "Users can view their dinner ingredients"
  ON daily_meal_dinner_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_meals
      WHERE daily_meals.id = daily_meal_dinner_ingredients.daily_meal_id
      AND daily_meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their dinner ingredients"
  ON daily_meal_dinner_ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM daily_meals
      WHERE daily_meals.id = daily_meal_dinner_ingredients.daily_meal_id
      AND daily_meals.user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour récupérer un daily meal avec tous ses détails
CREATE OR REPLACE FUNCTION get_daily_meal_with_details(p_user_id UUID, p_date DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', dm.id,
    'date', dm.date,
    'lunch', json_build_object(
      'recipe', (
        SELECT json_build_object('id', r.id, 'name', r.name)
        FROM recipes r
        WHERE r.id = dm.lunch_recipe_id
      ),
      'ingredients', (
        SELECT COALESCE(json_agg(json_build_object('id', i.id, 'name', i.name, 'category', i.category)), '[]'::json)
        FROM daily_meal_lunch_ingredients dmli
        JOIN ingredients i ON i.id = dmli.ingredient_id
        WHERE dmli.daily_meal_id = dm.id
      )
    ),
    'dinner', json_build_object(
      'recipe', (
        SELECT json_build_object('id', r.id, 'name', r.name)
        FROM recipes r
        WHERE r.id = dm.dinner_recipe_id
      ),
      'ingredients', (
        SELECT COALESCE(json_agg(json_build_object('id', i.id, 'name', i.name, 'category', i.category)), '[]'::json)
        FROM daily_meal_dinner_ingredients dmdi
        JOIN ingredients i ON i.id = dmdi.ingredient_id
        WHERE dmdi.daily_meal_id = dm.id
      )
    ),
    'created_at', dm.created_at,
    'updated_at', dm.updated_at
  ) INTO result
  FROM daily_meals dm
  WHERE dm.user_id = p_user_id AND dm.date = p_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================

