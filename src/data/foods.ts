export type Food = {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  tags?: string[];
};

export const FOODS: Food[] = [
  { id: "roti", name: "Roti / chapati", serving: "1 medium (40 g)", calories: 120, protein: 3.5, carbs: 22, fat: 2.5, fiber: 3, tags: ["indian", "staple"] },
  { id: "phulka", name: "Phulka", serving: "1 medium", calories: 85, protein: 3, carbs: 17, fat: 0.5, fiber: 2.5, tags: ["indian", "staple"] },
  { id: "paratha", name: "Plain paratha", serving: "1 medium", calories: 180, protein: 4, carbs: 26, fat: 7, fiber: 2.5, tags: ["indian", "breakfast"] },
  { id: "aloo-paratha", name: "Aloo paratha", serving: "1 medium", calories: 260, protein: 6, carbs: 40, fat: 9, fiber: 4, tags: ["indian", "breakfast"] },
  { id: "idli", name: "Idli", serving: "2 pieces", calories: 120, protein: 4, carbs: 24, fat: 1, fiber: 2, tags: ["indian", "south indian", "breakfast"] },
  { id: "dosa", name: "Plain dosa", serving: "1 medium", calories: 130, protein: 3, carbs: 24, fat: 3, fiber: 1.5, tags: ["indian", "south indian", "breakfast"] },
  { id: "masala-dosa", name: "Masala dosa", serving: "1 medium", calories: 250, protein: 5, carbs: 38, fat: 9, fiber: 3, tags: ["indian", "south indian", "breakfast"] },
  { id: "upma", name: "Upma", serving: "1 bowl (200 g)", calories: 220, protein: 5, carbs: 36, fat: 6, fiber: 4, tags: ["indian", "south indian", "breakfast"] },
  { id: "poha", name: "Vegetable poha", serving: "1 bowl (200 g)", calories: 250, protein: 5, carbs: 44, fat: 6, fiber: 4, tags: ["indian", "breakfast"] },
  { id: "pongal", name: "Ven pongal", serving: "1 bowl", calories: 280, protein: 8, carbs: 42, fat: 9, fiber: 4, tags: ["indian", "south indian", "breakfast"] },
  { id: "vada", name: "Medu vada", serving: "1 piece", calories: 160, protein: 4, carbs: 16, fat: 9, fiber: 2, tags: ["indian", "south indian", "snack"] },
  { id: "sambar", name: "Sambar", serving: "1 bowl (150 ml)", calories: 110, protein: 5, carbs: 15, fat: 3, fiber: 3, tags: ["indian", "south indian"] },
  { id: "rasam", name: "Rasam", serving: "1 bowl (150 ml)", calories: 60, protein: 2, carbs: 8, fat: 2, fiber: 1.5, tags: ["indian", "south indian"] },
  { id: "curd-rice", name: "Curd rice", serving: "1 bowl (200 g)", calories: 300, protein: 9, carbs: 45, fat: 8, fiber: 2, tags: ["indian", "south indian"] },
  { id: "lemon-rice", name: "Lemon rice", serving: "1 bowl (200 g)", calories: 320, protein: 6, carbs: 50, fat: 10, fiber: 2, tags: ["indian", "south indian"] },
  { id: "rajma", name: "Rajma curry", serving: "1 bowl (200 g)", calories: 220, protein: 11, carbs: 30, fat: 6, fiber: 9, tags: ["indian", "north indian", "vegetarian"] },
  { id: "chana", name: "Chana masala", serving: "1 bowl (200 g)", calories: 240, protein: 11, carbs: 32, fat: 7, fiber: 9, tags: ["indian", "north indian", "vegetarian"] },
  { id: "dal-tadka", name: "Dal tadka", serving: "1 bowl (200 g)", calories: 180, protein: 10, carbs: 24, fat: 5, fiber: 6, tags: ["indian", "staple", "vegetarian"] },
  { id: "dal-makhani", name: "Dal makhani", serving: "1 bowl (200 g)", calories: 300, protein: 11, carbs: 30, fat: 15, fiber: 7, tags: ["indian", "north indian", "vegetarian"] },
  { id: "paneer-butter", name: "Paneer butter masala", serving: "1 bowl (200 g)", calories: 380, protein: 14, carbs: 18, fat: 28, fiber: 3, tags: ["indian", "north indian", "vegetarian"] },
  { id: "palak-paneer", name: "Palak paneer", serving: "1 bowl (200 g)", calories: 300, protein: 15, carbs: 14, fat: 21, fiber: 4, tags: ["indian", "north indian", "vegetarian"] },
  { id: "chicken-curry", name: "Chicken curry", serving: "1 bowl (200 g)", calories: 280, protein: 24, carbs: 10, fat: 16, fiber: 2, tags: ["indian", "non-veg"] },
  { id: "egg-curry", name: "Egg curry", serving: "2 eggs + gravy", calories: 220, protein: 14, carbs: 9, fat: 14, fiber: 2, tags: ["indian", "non-veg"] },
  { id: "fish-curry", name: "Fish curry", serving: "1 bowl (200 g)", calories: 240, protein: 24, carbs: 8, fat: 12, fiber: 1, tags: ["indian", "non-veg"] },
  { id: "veg-biryani", name: "Vegetable biryani", serving: "1 plate (300 g)", calories: 350, protein: 7, carbs: 58, fat: 10, fiber: 4, tags: ["indian", "rice"] },
  { id: "chicken-biryani", name: "Chicken biryani", serving: "1 plate (300 g)", calories: 420, protein: 20, carbs: 52, fat: 14, fiber: 3, tags: ["indian", "rice", "non-veg"] },
  { id: "pulao", name: "Vegetable pulao", serving: "1 bowl (200 g)", calories: 280, protein: 6, carbs: 46, fat: 8, fiber: 3, tags: ["indian", "rice"] },
  { id: "khichdi", name: "Moong dal khichdi", serving: "1 bowl (250 g)", calories: 260, protein: 11, carbs: 42, fat: 5, fiber: 6, tags: ["indian", "comfort", "vegetarian"] },
  { id: "curd", name: "Curd / yogurt", serving: "1 cup (150 g)", calories: 100, protein: 6, carbs: 8, fat: 4, fiber: 0, tags: ["dairy", "protein"] },
  { id: "raita", name: "Cucumber raita", serving: "1 bowl (150 g)", calories: 80, protein: 4, carbs: 7, fat: 4, fiber: 1, tags: ["indian", "dairy"] },
  { id: "paneer", name: "Paneer", serving: "100 g", calories: 265, protein: 18, carbs: 3, fat: 21, fiber: 0, tags: ["dairy", "protein", "vegetarian"] },
  { id: "tofu", name: "Tofu", serving: "100 g", calories: 76, protein: 8, carbs: 2, fat: 5, fiber: 1, tags: ["protein", "vegetarian"] },
  { id: "soya", name: "Soya chunks (dry)", serving: "50 g", calories: 170, protein: 26, carbs: 12, fat: 1, fiber: 5, tags: ["protein", "vegetarian"] },
  { id: "eggs", name: "Boiled eggs", serving: "2 large", calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, tags: ["protein", "non-veg"] },
  { id: "omelette", name: "Vegetable omelette", serving: "2 eggs", calories: 220, protein: 14, carbs: 4, fat: 16, fiber: 1, tags: ["protein", "non-veg", "breakfast"] },
  { id: "chicken-breast", name: "Chicken breast", serving: "100 g cooked", calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, tags: ["protein", "non-veg"] },
  { id: "fish", name: "Grilled fish", serving: "100 g", calories: 140, protein: 24, carbs: 0, fat: 5, fiber: 0, tags: ["protein", "non-veg"] },
  { id: "prawns", name: "Prawns", serving: "100 g", calories: 99, protein: 24, carbs: 0, fat: 1, fiber: 0, tags: ["protein", "non-veg"] },
  { id: "whey", name: "Whey protein", serving: "1 scoop (30 g)", calories: 120, protein: 24, carbs: 3, fat: 2, fiber: 0, tags: ["protein", "supplement"] },
  { id: "milk", name: "Milk", serving: "250 ml", calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, tags: ["dairy", "drink"] },
  { id: "chai", name: "Chai with milk", serving: "1 cup (150 ml)", calories: 60, protein: 2, carbs: 8, fat: 2, fiber: 0, tags: ["drink", "indian"] },
  { id: "coffee", name: "Coffee with milk", serving: "1 cup (200 ml)", calories: 80, protein: 3, carbs: 10, fat: 3, fiber: 0, tags: ["drink"] },
  { id: "banana", name: "Banana", serving: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, tags: ["fruit"] },
  { id: "apple", name: "Apple", serving: "1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0, fiber: 4, tags: ["fruit"] },
  { id: "orange", name: "Orange", serving: "1 medium", calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, tags: ["fruit"] },
  { id: "mango", name: "Mango", serving: "1 cup", calories: 150, protein: 1, carbs: 38, fat: 0.5, fiber: 4, tags: ["fruit"] },
  { id: "papaya", name: "Papaya", serving: "1 cup", calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 2.5, tags: ["fruit"] },
  { id: "watermelon", name: "Watermelon", serving: "1 cup", calories: 46, protein: 1, carbs: 12, fat: 0, fiber: 0.6, tags: ["fruit"] },
  { id: "grapes", name: "Grapes", serving: "1 cup", calories: 104, protein: 1, carbs: 27, fat: 0, fiber: 1.4, tags: ["fruit"] },
  { id: "almonds", name: "Almonds", serving: "10 pieces", calories: 70, protein: 2.5, carbs: 2.5, fat: 6, fiber: 1.5, tags: ["snack", "nuts"] },
  { id: "peanuts", name: "Roasted peanuts", serving: "30 g", calories: 170, protein: 7, carbs: 6, fat: 14, fiber: 2, tags: ["snack", "nuts"] },
  { id: "walnuts", name: "Walnuts", serving: "30 g", calories: 196, protein: 4.5, carbs: 4, fat: 20, fiber: 2, tags: ["snack", "nuts"] },
  { id: "peanut-butter", name: "Peanut butter", serving: "1 tbsp", calories: 95, protein: 4, carbs: 3, fat: 8, fiber: 1, tags: ["snack"] },
  { id: "ghee", name: "Ghee", serving: "1 tsp", calories: 45, protein: 0, carbs: 0, fat: 5, fiber: 0, tags: ["fat"] },
  { id: "oil", name: "Cooking oil", serving: "1 tsp", calories: 40, protein: 0, carbs: 0, fat: 4.5, fiber: 0, tags: ["fat"] },
  { id: "sugar", name: "Sugar", serving: "1 tsp", calories: 16, protein: 0, carbs: 4, fat: 0, fiber: 0, tags: ["sweetener"] },
  { id: "jaggery", name: "Jaggery", serving: "1 tsp", calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0, tags: ["sweetener"] },
  { id: "bread", name: "White bread", serving: "1 slice", calories: 80, protein: 2.5, carbs: 14, fat: 1, fiber: 0.8, tags: ["staple"] },
  { id: "brown-bread", name: "Brown bread", serving: "1 slice", calories: 80, protein: 3, carbs: 14, fat: 1, fiber: 2, tags: ["staple"] },
  { id: "oats", name: "Rolled oats", serving: "40 g dry", calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, tags: ["breakfast", "staple"] },
  { id: "muesli", name: "Muesli", serving: "50 g", calories: 190, protein: 5, carbs: 32, fat: 5, fiber: 4, tags: ["breakfast"] },
  { id: "cornflakes", name: "Cornflakes", serving: "30 g", calories: 110, protein: 2, carbs: 25, fat: 0.5, fiber: 1, tags: ["breakfast"] },
  { id: "quinoa", name: "Cooked quinoa", serving: "1 cup (185 g)", calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5, tags: ["grain"] },
  { id: "brown-rice", name: "Cooked brown rice", serving: "1 cup (195 g)", calories: 215, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, tags: ["grain"] },
  { id: "white-rice", name: "Cooked white rice", serving: "1 cup (195 g)", calories: 205, protein: 4, carbs: 45, fat: 0.5, fiber: 0.6, tags: ["grain"] },
  { id: "samosa", name: "Samosa", serving: "1 medium", calories: 260, protein: 4, carbs: 30, fat: 14, fiber: 3, tags: ["indian", "snack"] },
  { id: "pakora", name: "Pakora", serving: "4 pieces", calories: 200, protein: 5, carbs: 18, fat: 12, fiber: 3, tags: ["indian", "snack"] },
  { id: "gulab-jamun", name: "Gulab jamun", serving: "1 piece", calories: 150, protein: 2, carbs: 25, fat: 5, fiber: 0, tags: ["indian", "sweet"] },
  { id: "rasgulla", name: "Rasgulla", serving: "1 piece", calories: 125, protein: 3, carbs: 25, fat: 2, fiber: 0, tags: ["indian", "sweet"] },
  { id: "ice-cream", name: "Ice cream", serving: "100 g", calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.5, tags: ["sweet"] },
  { id: "dark-chocolate", name: "Dark chocolate", serving: "20 g", calories: 120, protein: 1.5, carbs: 9, fat: 8, fiber: 2, tags: ["sweet"] },
  { id: "protein-bar", name: "Protein bar", serving: "1 bar (60 g)", calories: 200, protein: 20, carbs: 20, fat: 6, fiber: 5, tags: ["snack", "protein"] },
  { id: "salad", name: "Mixed salad bowl", serving: "1 bowl (200 g)", calories: 80, protein: 3, carbs: 12, fat: 3, fiber: 5, tags: ["vegetable"] },
  { id: "sprouts", name: "Sprouts bowl", serving: "1 bowl (150 g)", calories: 125, protein: 8, carbs: 18, fat: 1, fiber: 6, tags: ["protein", "vegetarian"] },
  { id: "hummus", name: "Hummus", serving: "2 tbsp", calories: 70, protein: 2, carbs: 4, fat: 5, fiber: 1.5, tags: ["snack"] },
  { id: "chia", name: "Chia seeds", serving: "1 tbsp", calories: 60, protein: 2, carbs: 5, fat: 4, fiber: 5, tags: ["snack"] },
  { id: "flax", name: "Flax seeds", serving: "1 tbsp", calories: 55, protein: 2, carbs: 3, fat: 4, fiber: 3, tags: ["snack"] },
  { id: "greek-yogurt", name: "Greek yogurt", serving: "170 g", calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, tags: ["dairy", "protein"] },
  { id: "cottage-cheese", name: "Cottage cheese", serving: "100 g", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, tags: ["dairy", "protein"] },
  { id: "cheese", name: "Cheese slice", serving: "1 slice", calories: 70, protein: 4, carbs: 1, fat: 5.5, fiber: 0, tags: ["dairy"] },
  { id: "butter", name: "Butter", serving: "1 tsp", calories: 36, protein: 0, carbs: 0, fat: 4, fiber: 0, tags: ["fat"] },
  { id: "mayo", name: "Mayonnaise", serving: "1 tbsp", calories: 94, protein: 0, carbs: 0, fat: 10, fiber: 0, tags: ["condiment"] },
  { id: "ketchup", name: "Ketchup", serving: "1 tbsp", calories: 17, protein: 0, carbs: 4, fat: 0, fiber: 0, tags: ["condiment"] },
  { id: "soft-drink", name: "Soft drink", serving: "330 ml", calories: 140, protein: 0, carbs: 35, fat: 0, fiber: 0, tags: ["drink", "sweet"] },
  { id: "juice", name: "Fruit juice", serving: "250 ml", calories: 110, protein: 1, carbs: 26, fat: 0, fiber: 1, tags: ["drink"] },
  { id: "beer", name: "Beer", serving: "330 ml", calories: 140, protein: 1, carbs: 11, fat: 0, fiber: 0, tags: ["drink"] },
  { id: "wine", name: "Wine", serving: "150 ml", calories: 125, protein: 0, carbs: 4, fat: 0, fiber: 0, tags: ["drink"] },
  { id: "pizza", name: "Pizza slice", serving: "1 slice", calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, tags: ["meal", "fast food"] },
  { id: "burger", name: "Chicken burger", serving: "1 burger", calories: 500, protein: 24, carbs: 45, fat: 24, fiber: 3, tags: ["meal", "fast food"] },
  { id: "fries", name: "French fries", serving: "medium", calories: 365, protein: 4, carbs: 48, fat: 17, fiber: 4, tags: ["fast food"] },
  { id: "sandwich", name: "Vegetable sandwich", serving: "1 sandwich", calories: 250, protein: 8, carbs: 36, fat: 8, fiber: 4, tags: ["meal", "breakfast"] },
  { id: "pasta", name: "Pasta with sauce", serving: "1 cup", calories: 220, protein: 7, carbs: 40, fat: 4, fiber: 3, tags: ["meal"] },
  { id: "noodles", name: "Noodles", serving: "1 cup", calories: 220, protein: 6, carbs: 38, fat: 5, fiber: 2, tags: ["meal"] },
];

export function searchFoods(query: string, limit = 20): Food[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return FOODS.slice(0, limit);
  return FOODS.filter((food) => {
    const haystack = `${food.name} ${food.serving} ${(food.tags || []).join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, limit);
}

export type ExternalFood = Food & { barcode?: string; source: "open-food-facts" };

function fromOpenFoodFacts(product: any, fallbackName = "Packaged food"): ExternalFood | null {
  const nutriments = product?.nutriments || {};
  const calories =
    Number(nutriments["energy-kcal_serving"]) ||
    Number(nutriments["energy-kcal_100g"]) ||
    Number(nutriments.energy_value) ||
    0;
  if (!calories) return null;
  const serving = product.serving_size || (nutriments["energy-kcal_serving"] ? "1 serving" : "100 g");
  return {
    id: `off-${product.code || product._id || Date.now()}`,
    name: product.product_name || fallbackName,
    serving,
    calories: Math.round(calories),
    protein: Math.round((Number(nutriments.proteins_serving) || Number(nutriments.proteins_100g) || 0) * 10) / 10,
    carbs: Math.round((Number(nutriments.carbohydrates_serving) || Number(nutriments.carbohydrates_100g) || 0) * 10) / 10,
    fat: Math.round((Number(nutriments.fat_serving) || Number(nutriments.fat_100g) || 0) * 10) / 10,
    fiber: Math.round((Number(nutriments.fiber_serving) || Number(nutriments.fiber_100g) || 0) * 10) / 10,
    barcode: product.code,
    source: "open-food-facts",
    tags: ["packaged"],
  };
}

export async function searchPackagedFoods(query: string): Promise<ExternalFood[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "12");
  url.searchParams.set("fields", "code,product_name,serving_size,nutriments");
  try {
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(9000) });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.products || []).map((product: any) => fromOpenFoodFacts(product)).filter(Boolean) as ExternalFood[];
  } catch {
    return [];
  }
}

export async function lookupBarcode(barcode: string): Promise<ExternalFood | null> {
  const code = barcode.replace(/\D/g, "");
  if (code.length < 6) return null;
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,serving_size,nutriments`,
      { signal: AbortSignal.timeout(9000) },
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 1) return null;
    return fromOpenFoodFacts(data.product, `Barcode ${code}`);
  } catch {
    return null;
  }
}
