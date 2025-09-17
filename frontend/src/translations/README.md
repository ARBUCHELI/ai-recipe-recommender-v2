# Multi-Language Translation System

This project now includes a comprehensive multi-language translation system supporting 5 languages:

## Supported Languages

- 🇺🇸 **English** (en) - Default
- 🇪🇸 **Spanish** (es) - Español
- 🇫🇷 **French** (fr) - Français
- 🇩🇪 **German** (de) - Deutsch
- 🇷🇺 **Russian** (ru) - Русский

## Features

### 1. Translation Context & Hook
- Global translation context with `TranslationProvider`
- Easy-to-use `useTranslation()` hook
- Automatic fallback to English if translation is missing
- LocalStorage persistence for language preference

### 2. Language Switcher Component
- Beautiful dropdown with flag emojis
- Click-outside-to-close functionality
- Visual indication of current language
- Responsive design

### 3. Comprehensive Translation Coverage
The PersonalizedDashboard component is fully translated including:

#### Dashboard Structure
- Main title and subtitle
- Tab navigation (Meals, Timing, Shopping)
- Button labels and loading states

#### Meals Section
- Meal generation interface
- Recipe names in all languages
- Nutrition labels (calories, protein, carbs, fat)
- Randomized recipe selection per language

#### Timing Section  
- Meal timing recommendations
- Breakfast, lunch, dinner, and snack times
- Helpful timing tips
- Time ranges and descriptions

#### Shopping Section
- Grocery store information with localized distances
- Shopping list categories (Produce, Proteins, Pantry)
- Store ratings and features
- Complete shopping items in each language

## Usage

### Basic Translation
```tsx
import { useTranslation } from '@/contexts/TranslationContext';

const MyComponent = () => {
  const { t, currentLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>Current language: {currentLanguage}</p>
    </div>
  );
};
```

### Language Switching
```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Header = () => (
  <div className="flex justify-between">
    <h1>My App</h1>
    <LanguageSwitcher />
  </div>
);
```

### Arrays and Complex Objects
```tsx
// Translation file structure
{
  "shopping": {
    "shoppingList": {
      "produce": {
        "items": [
          "Avocados (2-3 pieces)",
          "Bananas (1 bunch)",
          "Spinach (1 bag)"
        ]
      }
    }
  }
}

// Usage in component
{t('dashboard.shopping.shoppingList.produce.items').map((item, index) => (
  <li key={index}>{item}</li>
))}
```

## Files Structure

```
src/
├── translations/
│   ├── en.json          # English translations
│   ├── es.json          # Spanish translations  
│   ├── fr.json          # French translations
│   ├── de.json          # German translations
│   ├── ru.json          # Russian translations
│   └── README.md        # This file
├── contexts/
│   └── TranslationContext.tsx  # Translation context and hook
└── components/
    ├── LanguageSwitcher.tsx     # Language selection dropdown
    ├── PersonalizedDashboard.tsx # Main translated component
    └── TranslationTest.tsx      # Test component
```

## Translation Keys Structure

The translation keys follow a hierarchical structure:

```
dashboard.
├── title
├── subtitle  
├── tabs.
│   ├── meals
│   ├── timing
│   └── shopping
├── meals.
│   ├── title
│   ├── subtitle
│   ├── generateButton
│   ├── loading
│   ├── breakfast/lunch/dinner
│   ├── calories/protein/carbs/fat/grams
│   └── recipeList.
│       ├── breakfast.{avocadoToast, greekYogurt, oatmeal}
│       ├── lunch.{quinoaSalad, chickenWrap, lentilSoup}  
│       └── dinner.{salmonRice, stirfry, chickenBroccoli}
├── timing.
│   ├── title/subtitle
│   ├── breakfast/morningSnack/lunch/afternoonSnack/dinner.
│   │   ├── title
│   │   ├── time  
│   │   └── description
│   └── tips.{title, tip1, tip2, tip3}
├── shopping.
│   ├── title/subtitle
│   ├── groceryStores.
│   │   ├── title/rating
│   │   └── stores.{wholefoods, safeway, traderjoes}.
│   │       ├── name/distance/features
│   └── shoppingList.
│       ├── title
│       └── {produce, proteins, pantry}.
│           ├── title
│           └── items[]
└── common.{loading, error, retry, etc}
```

## Testing

Use the `TranslationTest` component to verify all translations are working correctly:

```tsx
import { TranslationTest } from '@/components/TranslationTest';

// Render this component to test translation functionality
<TranslationTest />
```

## Adding New Languages

1. Create a new translation file (e.g., `it.json` for Italian)
2. Add the language to the `LANGUAGES` object in `TranslationContext.tsx`
3. Import and add to the `translations` object
4. The language will automatically appear in the LanguageSwitcher

## Best Practices

1. **Consistent Keys**: Use descriptive, hierarchical keys
2. **Fallback Strategy**: Always provide English translations as fallback
3. **Context**: Keep translation keys organized by component/section
4. **Arrays**: Use arrays for lists that need to be mapped in components
5. **Testing**: Use the test component to verify all translations work

## Implementation Status ✅

- [x] Translation system architecture
- [x] 5-language support (EN, ES, FR, DE, RU)
- [x] Language switcher component
- [x] PersonalizedDashboard fully translated
- [x] Recipe recommendations in all languages
- [x] Shopping recommendations localized
- [x] Meal timing translations
- [x] LocalStorage language persistence
- [x] TypeScript support
- [x] Comprehensive testing component

The multi-language system is now fully implemented and ready for production use!