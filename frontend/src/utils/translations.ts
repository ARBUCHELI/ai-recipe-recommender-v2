export type Language = 'en' | 'es' | 'fr' | 'de' | 'ru';

export interface Translation {
  // Dashboard UI
  dashboard: {
    title: string;
    subtitle: string;
    overview: string;
    mealPlans: string;
    mealTiming: string;
    shopping: string;
    generateMeals: string;
    generating: string;
    success: string;
    error: string;
  };
  
  // Nutrition labels
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    water: string;
    bmi: string;
    category: string;
    bmr: string;
    tdee: string;
    healthScore: string;
    dailyTargets: string;
    healthMetrics: string;
    totalCalories: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string;
    instructions: string;
  };

  // Recipe names and descriptions
  recipes: {
    breakfast: {
      name: string;
      description: string;
    };
    lunch: {
      name: string;
      description: string;
    };
    dinner: {
      name: string;
      description: string;
    };
  };

  // Common ingredients (translated)
  ingredients: {
    eggs: string;
    oats: string;
    blueberries: string;
    banana: string;
    almondButter: string;
    honey: string;
    milk: string;
    cinnamon: string;
    chickenBreast: string;
    quinoa: string;
    mixedGreens: string;
    cucumber: string;
    cherryTomatoes: string;
    fetaCheese: string;
    oliveOil: string;
    lemonJuice: string;
    oregano: string;
    saltPepper: string;
    salmonFillet: string;
    broccoli: string;
    sweetPotato: string;
    redBellPepper: string;
    freshDill: string;
    garlicPowder: string;
    lemon: string;
  };

  // Cooking instructions (translated)
  cookingInstructions: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };

  // Shopping categories and items
  shopping: {
    focusAreas: string;
    priorityItems: string;
    nearestStores: string;
    viewMoreStores: string;
    openUntil: string;
    milesAway: string;
    organic: string;
    freshProduce: string;
    healthFoods: string;
    affordable: string;
    uniqueProducts: string;
    frozenFoods: string;
    oneStopShop: string;
    goodPrices: string;
    lateHours: string;
  };

  // Meal timing
  timing: {
    optimalMealTimes: string;
    snackTimes: string;
    hydrationSchedule: string;
    metabolismTips: string;
    generateMealTiming: string;
    calculating: string;
    meal: string;
  };

  // Health status descriptions
  health: {
    excellent: string;
    good: string;
    fair: string;
    needsImprovement: string;
    normal: string;
    underweight: string;
    overweight: string;
    obese: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    dashboard: {
      title: "Your Personalized Health Dashboard",
      subtitle: "Tailored recommendations based on your health profile and goals",
      overview: "Overview",
      mealPlans: "Meal Plans",
      mealTiming: "Meal Timing",
      shopping: "Shopping",
      generateMeals: "Generate Personalized Meals",
      generating: "Generating...",
      success: "Success!",
      error: "Error"
    },
    nutrition: {
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
      fiber: "Fiber",
      water: "Water Needs",
      bmi: "BMI",
      category: "Category",
      bmr: "BMR",
      tdee: "TDEE",
      healthScore: "Health Score",
      dailyTargets: "Daily Targets",
      healthMetrics: "Health Metrics",
      totalCalories: "Total Calories",
      prepTime: "Prep",
      cookTime: "Cook",
      servings: "Servings",
      ingredients: "Ingredients",
      instructions: "Instructions"
    },
    recipes: {
      breakfast: {
        name: "Power Protein Breakfast Bowl",
        description: "A nutritious breakfast featuring eggs, oats, and fresh berries to fuel your morning."
      },
      lunch: {
        name: "Mediterranean Chicken Salad",
        description: "A fresh and protein-rich salad with grilled chicken, quinoa, and Mediterranean flavors."
      },
      dinner: {
        name: "Herb-Crusted Salmon with Roasted Vegetables",
        description: "A delicious and healthy dinner featuring omega-3 rich salmon with colorful roasted vegetables."
      }
    },
    ingredients: {
      eggs: "large eggs",
      oats: "rolled oats",
      blueberries: "fresh blueberries",
      banana: "medium banana, sliced",
      almondButter: "almond butter",
      honey: "honey",
      milk: "milk",
      cinnamon: "cinnamon",
      chickenBreast: "grilled chicken breast",
      quinoa: "cooked quinoa",
      mixedGreens: "mixed greens",
      cucumber: "cucumber, diced",
      cherryTomatoes: "cherry tomatoes",
      fetaCheese: "feta cheese",
      oliveOil: "olive oil",
      lemonJuice: "lemon juice",
      oregano: "oregano",
      saltPepper: "Salt and pepper to taste",
      salmonFillet: "salmon fillet",
      broccoli: "broccoli florets",
      sweetPotato: "sweet potato, cubed",
      redBellPepper: "red bell pepper, sliced",
      freshDill: "fresh dill",
      garlicPowder: "garlic powder",
      lemon: "lemon, juiced"
    },
    cookingInstructions: {
      breakfast: [
        "Cook eggs to your preference (scrambled or over-easy).",
        "Prepare oats with milk according to package directions.",
        "In a bowl, layer the cooked oats.",
        "Top with cooked eggs, sliced banana, and fresh blueberries.",
        "Drizzle with almond butter and honey.",
        "Sprinkle with cinnamon and serve immediately."
      ],
      lunch: [
        "Season and grill chicken breast until cooked through.",
        "Cook quinoa according to package directions and let cool.",
        "In a large bowl, combine mixed greens, quinoa, cucumber, and tomatoes.",
        "Slice the grilled chicken and add to the salad.",
        "Top with crumbled feta cheese.",
        "Whisk together olive oil, lemon juice, oregano, salt, and pepper.",
        "Drizzle dressing over salad and toss gently."
      ],
      dinner: [
        "Preheat oven to 425°F (220°C).",
        "Toss vegetables with 1 tbsp olive oil, salt, and pepper.",
        "Spread vegetables on a baking sheet and roast for 20 minutes.",
        "Season salmon with dill, garlic powder, salt, and pepper.",
        "Heat remaining olive oil in a pan over medium-high heat.",
        "Cook salmon for 4-5 minutes per side until flaky.",
        "Serve salmon over roasted vegetables with lemon juice."
      ]
    },
    shopping: {
      focusAreas: "Focus Areas",
      priorityItems: "Priority Items",
      nearestStores: "Nearest Grocery Stores",
      viewMoreStores: "View More Stores",
      openUntil: "Open until",
      milesAway: "miles away",
      organic: "Organic",
      freshProduce: "Fresh Produce",
      healthFoods: "Health Foods",
      affordable: "Affordable",
      uniqueProducts: "Unique Products",
      frozenFoods: "Frozen Foods",
      oneStopShop: "One-Stop Shop",
      goodPrices: "Good Prices",
      lateHours: "Late Hours"
    },
    timing: {
      optimalMealTimes: "Optimal Meal Times",
      snackTimes: "Snack Times",
      hydrationSchedule: "Hydration Schedule",
      metabolismTips: "Metabolism Tips",
      generateMealTiming: "Generating Meal Timing...",
      calculating: "Please wait while we calculate your optimal meal times.",
      meal: "Meal"
    },
    health: {
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needsImprovement: "Needs Improvement",
      normal: "Normal",
      underweight: "Underweight",
      overweight: "Overweight",
      obese: "Obese"
    }
  },

  es: {
    dashboard: {
      title: "Tu Panel de Salud Personalizado",
      subtitle: "Recomendaciones adaptadas según tu perfil de salud y objetivos",
      overview: "Resumen",
      mealPlans: "Planes de Comida",
      mealTiming: "Horarios de Comida",
      shopping: "Compras",
      generateMeals: "Generar Comidas Personalizadas",
      generating: "Generando...",
      success: "¡Éxito!",
      error: "Error"
    },
    nutrition: {
      calories: "Calorías",
      protein: "Proteína",
      carbs: "Carbohidratos",
      fat: "Grasa",
      fiber: "Fibra",
      water: "Necesidades de Agua",
      bmi: "IMC",
      category: "Categoría",
      bmr: "TMB",
      tdee: "TDEE",
      healthScore: "Puntuación de Salud",
      dailyTargets: "Objetivos Diarios",
      healthMetrics: "Métricas de Salud",
      totalCalories: "Calorías Totales",
      prepTime: "Prep.",
      cookTime: "Cocción",
      servings: "Porciones",
      ingredients: "Ingredientes",
      instructions: "Instrucciones"
    },
    recipes: {
      breakfast: {
        name: "Bowl de Desayuno Proteico Energético",
        description: "Un desayuno nutritivo con huevos, avena y fresas frescas para energizar tu mañana."
      },
      lunch: {
        name: "Ensalada Mediterránea de Pollo",
        description: "Una ensalada fresca y rica en proteínas con pollo a la parrilla, quinoa y sabores mediterráneos."
      },
      dinner: {
        name: "Salmón con Costra de Hierbas y Vegetales Asados",
        description: "Una cena deliciosa y saludable con salmón rico en omega-3 y vegetales coloridos asados."
      }
    },
    ingredients: {
      eggs: "huevos grandes",
      oats: "avena en hojuelas",
      blueberries: "arándanos frescos",
      banana: "plátano mediano, cortado",
      almondButter: "mantequilla de almendra",
      honey: "miel",
      milk: "leche",
      cinnamon: "canela",
      chickenBreast: "pechuga de pollo a la parrilla",
      quinoa: "quinoa cocida",
      mixedGreens: "verduras mixtas",
      cucumber: "pepino, cortado en cubitos",
      cherryTomatoes: "tomates cherry",
      fetaCheese: "queso feta",
      oliveOil: "aceite de oliva",
      lemonJuice: "jugo de limón",
      oregano: "orégano",
      saltPepper: "Sal y pimienta al gusto",
      salmonFillet: "filete de salmón",
      broccoli: "floretes de brócoli",
      sweetPotato: "batata, cortada en cubos",
      redBellPepper: "pimiento rojo, cortado",
      freshDill: "eneldo fresco",
      garlicPowder: "ajo en polvo",
      lemon: "limón, exprimido"
    },
    cookingInstructions: {
      breakfast: [
        "Cocina los huevos a tu preferencia (revueltos o estrellados).",
        "Prepara la avena con leche según las instrucciones del paquete.",
        "En un bowl, coloca la avena cocida en capas.",
        "Agrega los huevos cocidos, plátano cortado y arándanos frescos.",
        "Rocía con mantequilla de almendra y miel.",
        "Espolvorea con canela y sirve inmediatamente."
      ],
      lunch: [
        "Sazona y asa la pechuga de pollo hasta que esté bien cocida.",
        "Cocina la quinoa según las instrucciones del paquete y deja enfriar.",
        "En un bowl grande, combina las verduras mixtas, quinoa, pepino y tomates.",
        "Corta el pollo asado y agrégalo a la ensalada.",
        "Agrega el queso feta desmenuzado.",
        "Mezcla aceite de oliva, jugo de limón, orégano, sal y pimienta.",
        "Rocía el aderezo sobre la ensalada y mezcla suavemente."
      ],
      dinner: [
        "Precalienta el horno a 425°F (220°C).",
        "Mezcla los vegetales con 1 cucharada de aceite de oliva, sal y pimienta.",
        "Extiende los vegetales en una bandeja y asa por 20 minutos.",
        "Sazona el salmón con eneldo, ajo en polvo, sal y pimienta.",
        "Calienta el aceite restante en una sartén a fuego medio-alto.",
        "Cocina el salmón 4-5 minutos por lado hasta que se desmenuce.",
        "Sirve el salmón sobre los vegetales asados con jugo de limón."
      ]
    },
    shopping: {
      focusAreas: "Áreas de Enfoque",
      priorityItems: "Artículos Prioritarios",
      nearestStores: "Tiendas de Comestibles Más Cercanas",
      viewMoreStores: "Ver Más Tiendas",
      openUntil: "Abierto hasta",
      milesAway: "millas de distancia",
      organic: "Orgánico",
      freshProduce: "Productos Frescos",
      healthFoods: "Alimentos Saludables",
      affordable: "Asequible",
      uniqueProducts: "Productos Únicos",
      frozenFoods: "Congelados",
      oneStopShop: "Todo en Uno",
      goodPrices: "Buenos Precios",
      lateHours: "Horario Extendido"
    },
    timing: {
      optimalMealTimes: "Horarios Óptimos de Comida",
      snackTimes: "Horarios de Snacks",
      hydrationSchedule: "Horario de Hidratación",
      metabolismTips: "Consejos de Metabolismo",
      generateMealTiming: "Generando Horarios de Comida...",
      calculating: "Por favor espera mientras calculamos tus horarios óptimos de comida.",
      meal: "Comida"
    },
    health: {
      excellent: "Excelente",
      good: "Bueno",
      fair: "Regular",
      needsImprovement: "Necesita Mejora",
      normal: "Normal",
      underweight: "Bajo Peso",
      overweight: "Sobrepeso",
      obese: "Obeso"
    }
  },

  fr: {
    dashboard: {
      title: "Votre Tableau de Bord Santé Personnalisé",
      subtitle: "Recommandations adaptées à votre profil de santé et vos objectifs",
      overview: "Aperçu",
      mealPlans: "Plans de Repas",
      mealTiming: "Horaires des Repas",
      shopping: "Achats",
      generateMeals: "Générer des Repas Personnalisés",
      generating: "Génération...",
      success: "Succès !",
      error: "Erreur"
    },
    nutrition: {
      calories: "Calories",
      protein: "Protéines",
      carbs: "Glucides",
      fat: "Lipides",
      fiber: "Fibres",
      water: "Besoins en Eau",
      bmi: "IMC",
      category: "Catégorie",
      bmr: "MB",
      tdee: "TDEE",
      healthScore: "Score de Santé",
      dailyTargets: "Objectifs Quotidiens",
      healthMetrics: "Métriques de Santé",
      totalCalories: "Calories Totales",
      prepTime: "Prép.",
      cookTime: "Cuisson",
      servings: "Portions",
      ingredients: "Ingrédients",
      instructions: "Instructions"
    },
    recipes: {
      breakfast: {
        name: "Bowl Protéiné du Petit-Déjeuner",
        description: "Un petit-déjeuner nutritif avec des œufs, de l'avoine et des baies fraîches pour énergiser votre matinée."
      },
      lunch: {
        name: "Salade Méditerranéenne au Poulet",
        description: "Une salade fraîche et riche en protéines avec du poulet grillé, du quinoa et des saveurs méditerranéennes."
      },
      dinner: {
        name: "Saumon en Croûte d'Herbes aux Légumes Rôtis",
        description: "Un dîner délicieux et sain avec du saumon riche en oméga-3 et des légumes colorés rôtis."
      }
    },
    ingredients: {
      eggs: "gros œufs",
      oats: "flocons d'avoine",
      blueberries: "myrtilles fraîches",
      banana: "banane moyenne, tranchée",
      almondButter: "beurre d'amande",
      honey: "miel",
      milk: "lait",
      cinnamon: "cannelle",
      chickenBreast: "poitrine de poulet grillée",
      quinoa: "quinoa cuit",
      mixedGreens: "mélange de verdures",
      cucumber: "concombre, coupé en dés",
      cherryTomatoes: "tomates cerises",
      fetaCheese: "fromage feta",
      oliveOil: "huile d'olive",
      lemonJuice: "jus de citron",
      oregano: "origan",
      saltPepper: "Sel et poivre au goût",
      salmonFillet: "filet de saumon",
      broccoli: "fleurons de brocoli",
      sweetPotato: "patate douce, coupée en cubes",
      redBellPepper: "poivron rouge, tranché",
      freshDill: "aneth frais",
      garlicPowder: "poudre d'ail",
      lemon: "citron, pressé"
    },
    cookingInstructions: {
      breakfast: [
        "Cuisinez les œufs selon votre préférence (brouillés ou au plat).",
        "Préparez l'avoine avec du lait selon les instructions du paquet.",
        "Dans un bol, disposez l'avoine cuite en couches.",
        "Ajoutez les œufs cuits, la banane tranchée et les myrtilles fraîches.",
        "Arrosez de beurre d'amande et de miel.",
        "Saupoudrez de cannelle et servez immédiatement."
      ],
      lunch: [
        "Assaisonnez et grillez la poitrine de poulet jusqu'à cuisson complète.",
        "Cuisinez le quinoa selon les instructions du paquet et laissez refroidir.",
        "Dans un grand bol, mélangez les verdures, le quinoa, le concombre et les tomates.",
        "Tranchez le poulet grillé et ajoutez-le à la salade.",
        "Ajoutez le fromage feta émietté.",
        "Fouettez ensemble l'huile d'olive, le jus de citron, l'origan, le sel et le poivre.",
        "Arrosez la salade d'assaisonnement et mélangez délicatement."
      ],
      dinner: [
        "Préchauffez le four à 425°F (220°C).",
        "Mélangez les légumes avec 1 c. à soupe d'huile d'olive, sel et poivre.",
        "Étalez les légumes sur une plaque et rôtissez pendant 20 minutes.",
        "Assaisonnez le saumon avec l'aneth, la poudre d'ail, le sel et le poivre.",
        "Chauffez l'huile restante dans une poêle à feu moyen-vif.",
        "Cuisinez le saumon 4-5 minutes de chaque côté jusqu'à ce qu'il s'effeuille.",
        "Servez le saumon sur les légumes rôtis avec du jus de citron."
      ]
    },
    shopping: {
      focusAreas: "Domaines d'Attention",
      priorityItems: "Articles Prioritaires",
      nearestStores: "Épiceries les Plus Proches",
      viewMoreStores: "Voir Plus de Magasins",
      openUntil: "Ouvert jusqu'à",
      milesAway: "miles de distance",
      organic: "Bio",
      freshProduce: "Produits Frais",
      healthFoods: "Aliments Santé",
      affordable: "Abordable",
      uniqueProducts: "Produits Uniques",
      frozenFoods: "Surgelés",
      oneStopShop: "Tout en Un",
      goodPrices: "Bons Prix",
      lateHours: "Horaires Tardifs"
    },
    timing: {
      optimalMealTimes: "Horaires de Repas Optimaux",
      snackTimes: "Horaires de Collations",
      hydrationSchedule: "Programme d'Hydratation",
      metabolismTips: "Conseils Métabolisme",
      generateMealTiming: "Génération des Horaires de Repas...",
      calculating: "Veuillez patienter pendant que nous calculons vos horaires de repas optimaux.",
      meal: "Repas"
    },
    health: {
      excellent: "Excellent",
      good: "Bon",
      fair: "Moyen",
      needsImprovement: "À Améliorer",
      normal: "Normal",
      underweight: "Insuffisance Pondérale",
      overweight: "Surpoids",
      obese: "Obèse"
    }
  },

  de: {
    dashboard: {
      title: "Ihr Personalisiertes Gesundheits-Dashboard",
      subtitle: "Maßgeschneiderte Empfehlungen basierend auf Ihrem Gesundheitsprofil und Ihren Zielen",
      overview: "Übersicht",
      mealPlans: "Essenspläne",
      mealTiming: "Essenszeiten",
      shopping: "Einkaufen",
      generateMeals: "Personalisierte Mahlzeiten Generieren",
      generating: "Wird generiert...",
      success: "Erfolg!",
      error: "Fehler"
    },
    nutrition: {
      calories: "Kalorien",
      protein: "Protein",
      carbs: "Kohlenhydrate",
      fat: "Fett",
      fiber: "Ballaststoffe",
      water: "Wasserbedarf",
      bmi: "BMI",
      category: "Kategorie",
      bmr: "GU",
      tdee: "TDEE",
      healthScore: "Gesundheitswert",
      dailyTargets: "Tägliche Ziele",
      healthMetrics: "Gesundheitsmetriken",
      totalCalories: "Gesamtkalorien",
      prepTime: "Vorb.",
      cookTime: "Kochzeit",
      servings: "Portionen",
      ingredients: "Zutaten",
      instructions: "Anweisungen"
    },
    recipes: {
      breakfast: {
        name: "Power-Protein Frühstücks-Bowl",
        description: "Ein nahrhaftes Frühstück mit Eiern, Haferflocken und frischen Beeren für Ihren Morgen."
      },
      lunch: {
        name: "Mediterraner Hähnchensalat",
        description: "Ein frischer, proteinreicher Salat mit gegrilltem Hähnchen, Quinoa und mediterranen Aromen."
      },
      dinner: {
        name: "Kräuterkrustenlachs mit Röstgemüse",
        description: "Ein köstliches und gesundes Abendessen mit omega-3-reichem Lachs und buntem Röstgemüse."
      }
    },
    ingredients: {
      eggs: "große Eier",
      oats: "Haferflocken",
      blueberries: "frische Heidelbeeren",
      banana: "mittelgroße Banane, geschnitten",
      almondButter: "Mandelbutter",
      honey: "Honig",
      milk: "Milch",
      cinnamon: "Zimt",
      chickenBreast: "gegrillte Hähnchenbrust",
      quinoa: "gekochte Quinoa",
      mixedGreens: "gemischte Blattsalate",
      cucumber: "Gurke, gewürfelt",
      cherryTomatoes: "Kirschtomaten",
      fetaCheese: "Fetakäse",
      oliveOil: "Olivenöl",
      lemonJuice: "Zitronensaft",
      oregano: "Oregano",
      saltPepper: "Salz und Pfeffer nach Geschmack",
      salmonFillet: "Lachsfilet",
      broccoli: "Brokkoliröschen",
      sweetPotato: "Süßkartoffel, gewürfelt",
      redBellPepper: "rote Paprika, geschnitten",
      freshDill: "frischer Dill",
      garlicPowder: "Knoblauchpulver",
      lemon: "Zitrone, gepresst"
    },
    cookingInstructions: {
      breakfast: [
        "Kochen Sie die Eier nach Ihrer Vorliebe (Rührei oder Spiegelei).",
        "Bereiten Sie Haferflocken mit Milch nach Packungsanweisung zu.",
        "Schichten Sie die gekochten Haferflocken in einer Schüssel.",
        "Belegen Sie mit gekochten Eiern, geschnittener Banane und frischen Heidelbeeren.",
        "Mit Mandelbutter und Honig beträufeln.",
        "Mit Zimt bestreuen und sofort servieren."
      ],
      lunch: [
        "Hähnchenbrust würzen und grillen bis sie durchgegart ist.",
        "Quinoa nach Packungsanweisung kochen und abkühlen lassen.",
        "In einer großen Schüssel Blattsalate, Quinoa, Gurke und Tomaten mischen.",
        "Das gegrillte Hähnchen schneiden und zum Salat geben.",
        "Mit zerbröckeltem Fetakäse bestreuen.",
        "Olivenöl, Zitronensaft, Oregano, Salz und Pfeffer verquirlen.",
        "Dressing über den Salat geben und sanft mischen."
      ],
      dinner: [
        "Ofen auf 425°F (220°C) vorheizen.",
        "Gemüse mit 1 EL Olivenöl, Salz und Pfeffer vermengen.",
        "Gemüse auf einem Backblech verteilen und 20 Minuten rösten.",
        "Lachs mit Dill, Knoblauchpulver, Salz und Pfeffer würzen.",
        "Restliches Olivenöl in einer Pfanne bei mittlerer Hitze erhitzen.",
        "Lachs 4-5 Minuten pro Seite braten bis er zerfällt.",
        "Lachs über Röstgemüse mit Zitronensaft servieren."
      ]
    },
    shopping: {
      focusAreas: "Schwerpunktbereiche",
      priorityItems: "Prioritätsartikel",
      nearestStores: "Nächste Lebensmittelgeschäfte",
      viewMoreStores: "Mehr Geschäfte Anzeigen",
      openUntil: "Geöffnet bis",
      milesAway: "Meilen entfernt",
      organic: "Bio",
      freshProduce: "Frische Produkte",
      healthFoods: "Gesunde Lebensmittel",
      affordable: "Erschwinglich",
      uniqueProducts: "Einzigartige Produkte",
      frozenFoods: "Tiefkühlprodukte",
      oneStopShop: "Alles unter einem Dach",
      goodPrices: "Gute Preise",
      lateHours: "Lange Öffnungszeiten"
    },
    timing: {
      optimalMealTimes: "Optimale Essenszeiten",
      snackTimes: "Snack-Zeiten",
      hydrationSchedule: "Hydratationsplan",
      metabolismTips: "Stoffwechsel-Tipps",
      generateMealTiming: "Essenszeiten werden generiert...",
      calculating: "Bitte warten Sie, während wir Ihre optimalen Essenszeiten berechnen.",
      meal: "Mahlzeit"
    },
    health: {
      excellent: "Ausgezeichnet",
      good: "Gut",
      fair: "Mäßig",
      needsImprovement: "Verbesserung Nötig",
      normal: "Normal",
      underweight: "Untergewicht",
      overweight: "Übergewicht",
      obese: "Fettleibig"
    }
  },

  ru: {
    dashboard: {
      title: "Ваша Персональная Панель Здоровья",
      subtitle: "Индивидуальные рекомендации на основе вашего профиля здоровья и целей",
      overview: "Обзор",
      mealPlans: "Планы Питания",
      mealTiming: "Время Приёма Пищи",
      shopping: "Покупки",
      generateMeals: "Создать Персональные Блюда",
      generating: "Создание...",
      success: "Успех!",
      error: "Ошибка"
    },
    nutrition: {
      calories: "Калории",
      protein: "Белок",
      carbs: "Углеводы",
      fat: "Жир",
      fiber: "Клетчатка",
      water: "Потребность в Воде",
      bmi: "ИМТ",
      category: "Категория",
      bmr: "ОО",
      tdee: "TDEE",
      healthScore: "Показатель Здоровья",
      dailyTargets: "Дневные Цели",
      healthMetrics: "Показатели Здоровья",
      totalCalories: "Общие Калории",
      prepTime: "Подгот.",
      cookTime: "Готовка",
      servings: "Порции",
      ingredients: "Ингредиенты",
      instructions: "Инструкции"
    },
    recipes: {
      breakfast: {
        name: "Энергетическая Белковая Миска на Завтрак",
        description: "Питательный завтрак с яйцами, овсянкой и свежими ягодами для заряда энергии на утро."
      },
      lunch: {
        name: "Средиземноморский Салат с Курицей",
        description: "Свежий салат, богатый белком, с куриным грилем, киноа и средиземноморскими вкусами."
      },
      dinner: {
        name: "Лосось в Травяной Корочке с Жареными Овощами",
        description: "Вкусный и здоровый ужин с богатым омега-3 лососем и красочными жареными овощами."
      }
    },
    ingredients: {
      eggs: "крупных яйца",
      oats: "овсяные хлопья",
      blueberries: "свежая черника",
      banana: "средний банан, нарезанный",
      almondButter: "миндальное масло",
      honey: "мёд",
      milk: "молоко",
      cinnamon: "корица",
      chickenBreast: "куриная грудка гриль",
      quinoa: "варёная киноа",
      mixedGreens: "смешанная зелень",
      cucumber: "огурец, нарезанный кубиками",
      cherryTomatoes: "помидоры черри",
      fetaCheese: "сыр фета",
      oliveOil: "оливковое масло",
      lemonJuice: "лимонный сок",
      oregano: "орегано",
      saltPepper: "Соль и перец по вкусу",
      salmonFillet: "филе лосося",
      broccoli: "соцветия брокколи",
      sweetPotato: "батат, нарезанный кубиками",
      redBellPepper: "красный болгарский перец, нарезанный",
      freshDill: "свежий укроп",
      garlicPowder: "чесночный порошок",
      lemon: "лимон, выжатый"
    },
    cookingInstructions: {
      breakfast: [
        "Приготовьте яйца по вашему предпочтению (взбитые или глазунья).",
        "Приготовьте овсянку с молоком согласно инструкции на упаковке.",
        "В миске выложите слоями приготовленную овсянку.",
        "Сверху добавьте приготовленные яйца, нарезанный банан и свежую чернику.",
        "Полейте миндальным маслом и мёдом.",
        "Посыпьте корицей и подавайте немедленно."
      ],
      lunch: [
        "Приправьте и обжарьте куриную грудку до готовности.",
        "Сварите киноа согласно инструкции на упаковке и остудите.",
        "В большой миске смешайте зелень, киноа, огурец и помидоры.",
        "Нарежьте жареную курицу и добавьте в салат.",
        "Сверху добавьте раскрошенный сыр фета.",
        "Взбейте оливковое масло, лимонный сок, орегано, соль и перец.",
        "Полейте заправкой салат и аккуратно перемешайте."
      ],
      dinner: [
        "Разогрейте духовку до 425°F (220°C).",
        "Перемешайте овощи с 1 ст.л. оливкового масла, солью и перцем.",
        "Разложите овощи на противне и запекайте 20 минут.",
        "Приправьте лосося укропом, чесночным порошком, солью и перцем.",
        "Разогрейте оставшееся оливковое масло на сковороде на средне-сильном огне.",
        "Готовьте лосося 4-5 минут с каждой стороны до расслаивания.",
        "Подавайте лосося с жареными овощами и лимонным соком."
      ]
    },
    shopping: {
      focusAreas: "Области Фокуса",
      priorityItems: "Приоритетные Товары",
      nearestStores: "Ближайшие Продуктовые Магазины",
      viewMoreStores: "Показать Больше Магазинов",
      openUntil: "Открыто до",
      milesAway: "миль расстояние",
      organic: "Органические",
      freshProduce: "Свежие Продукты",
      healthFoods: "Здоровая Еда",
      affordable: "Доступные Цены",
      uniqueProducts: "Уникальные Товары",
      frozenFoods: "Замороженные Продукты",
      oneStopShop: "Всё в Одном Месте",
      goodPrices: "Хорошие Цены",
      lateHours: "Поздние Часы"
    },
    timing: {
      optimalMealTimes: "Оптимальное Время Приёма Пищи",
      snackTimes: "Время Перекусов",
      hydrationSchedule: "График Гидратации",
      metabolismTips: "Советы по Метаболизму",
      generateMealTiming: "Создание Графика Питания...",
      calculating: "Пожалуйста, подождите, пока мы рассчитываем ваше оптимальное время приёма пищи.",
      meal: "Приём Пищи"
    },
    health: {
      excellent: "Отлично",
      good: "Хорошо",
      fair: "Удовлетворительно",
      needsImprovement: "Требует Улучшения",
      normal: "Нормальный",
      underweight: "Недостаточный Вес",
      overweight: "Избыточный Вес",
      obese: "Ожирение"
    }
  }
};

// Helper function to get translation
export const getTranslation = (language: Language): Translation => {
  return translations[language] || translations.en; // Fallback to English
};

// Helper function to get current language (can be connected to context later)
export const getCurrentLanguage = (): Language => {
  // For now, return English. Later this can be connected to user preferences
  return 'en';
};