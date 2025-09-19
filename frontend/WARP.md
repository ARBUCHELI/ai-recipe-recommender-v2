# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the frontend for an AI Recipe Recommender application built with React, TypeScript, and Vite. The app allows users to upload ingredients, generate personalized recipes using AI, create meal plans, manage shopping lists, find nearby stores, and maintain health profiles with multi-language support.

## Development Commands

### Core Development
```bash
# Development server (runs on port 8080)
npm run dev

# Production build
npm run build

# Development build with source maps
npm run build:dev

# Preview production build locally
npm run preview

# Linting
npm run lint
```

### Package Management
```bash
# Install dependencies (uses both npm and bun lockfiles)
npm install

# Add new dependency
npm install <package-name>

# Add dev dependency
npm install -D <package-name>
```

## Architecture Overview

### Application Structure
- **Single Page Application (SPA)** with React Router
- **Component-based architecture** with reusable UI components via shadcn/ui
- **Context-driven state management** for auth, translations, and food categories
- **Service layer architecture** for API calls and business logic
- **Multi-language support** with real-time switching (5 languages: EN, ES, FR, DE, RU)

### Key Architectural Patterns

#### Context Providers (Layered)
```
QueryClientProvider (React Query)
└── TooltipProvider (shadcn/ui)
    └── TranslationProvider (i18n)
        └── AuthProvider (Authentication)
            └── App Components
```

#### Service Layer Pattern
- `aiService.ts` - AI recipe generation with auto-save capability
- `authService.ts` - Authentication management
- `recipeService.ts` - Recipe CRUD operations
- `locationService.ts` - Store location services
- `healthCalculationService.ts` - Health profile calculations
- `ingredientService.ts` - Ingredient management

#### Component Architecture
- **Pages**: Route-level components (`Index.tsx`, `NotFound.tsx`)
- **Components**: Feature components (HomePage, PersonalizedDashboard, etc.)
- **UI**: Reusable shadcn/ui components in `/components/ui/`
- **Contexts**: Global state management
- **Hooks**: Custom React hooks (`use-mobile.tsx`, `use-toast.ts`)

### Translation System
The app has comprehensive multi-language support:
- **Real-time language switching** without page reloads
- **Translation files**: JSON files in `src/translations/` for 5 languages
- **TranslationContext**: Provides `t()` function and language state
- **LocalStorage persistence** for user language preference
- **Fallback system** to English for missing translations

## Key Technologies

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **TailwindCSS** + shadcn/ui for styling
- **React Query** (@tanstack/react-query) for server state
- **React Router** for navigation
- **React Hook Form** + Zod for form validation
- **Hugging Face Transformers** for AI functionality
- **Lucide React** for icons

## Development Guidelines

### File Organization
```
src/
├── components/          # Feature components
│   ├── ui/             # shadcn/ui reusable components
│   ├── HomePage.tsx    # Landing page with features
│   ├── PersonalizedDashboard.tsx  # User dashboard
│   └── ...
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks  
├── lib/                # Utilities (utils.ts)
├── pages/              # Route components
├── services/           # API and business logic
├── translations/       # Multi-language JSON files
└── types/              # TypeScript type definitions
```

### Component Patterns
- Use **functional components** with hooks
- Leverage **shadcn/ui components** for consistent styling
- Implement **responsive design** with TailwindCSS breakpoints
- Use **TypeScript** for all components with proper type definitions
- Follow **React Query** patterns for server state management

### Styling Standards
- **TailwindCSS utility classes** for styling
- **Custom CSS variables** defined in index.css for theming
- **Responsive design** with mobile-first approach
- **Custom color palette** for food-themed UI (nutrition, cherry, paprika, etc.)
- **Animation classes** for smooth interactions

### State Management
- **React Query** for server state (recipes, user data)
- **React Context** for global client state (auth, translations, categories)
- **Local component state** for UI interactions
- **LocalStorage** for persistence (language, user preferences)

### Translation Usage
```tsx
// In any component
import { useTranslation } from '@/contexts/TranslationContext';

const MyComponent = () => {
  const { t, currentLanguage, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('homepage.hero.title')}</h1>
      <p>{t('common.loading', 'Loading...')}</p> {/* with fallback */}
    </div>
  );
};
```

## Testing and Quality

### Code Quality
- **ESLint** configuration with React and TypeScript rules
- **TypeScript** strict mode disabled for flexibility during development
- **Unused parameter/variable** warnings disabled for rapid prototyping

### Browser Support
- **Modern browsers** with ES2020 support
- **Mobile responsive** design tested on various screen sizes

## Environment Configuration

### Development
- **Vite dev server** runs on `localhost:8080`
- **Hot module replacement** for fast development
- **Source maps** enabled in development builds
- **Component tagging** via lovable-tagger in development mode

### Path Aliases
```typescript
"@/*" => "./src/*"  // Import from src directory
```

### Asset Handling
- **Static assets** in `/public/` directory
- **Images** optimized for web usage
- **CSV/JSON** sample data files for ingredient imports

## Production Considerations

### Build Process
- **Vite production build** with optimization
- **TypeScript compilation** with type checking
- **TailwindCSS purging** for minimal bundle size
- **Asset optimization** and bundling

### Performance
- **React Query caching** for API responses
- **Component lazy loading** where appropriate
- **Optimized bundle splitting** via Vite

## Special Features

### AI Recipe Generation
- **Mock AI service** with realistic recipe generation
- **Auto-save functionality** to user account
- **Meal plan generation** for multiple days
- **Nutrition calculation** and health recommendations

### Health Profile System  
- **UserHealthProfile** type with comprehensive health data
- **Calorie calculations** based on user goals and activity
- **Personalized meal recommendations**
- **Health metrics tracking**

### Store Location Services
- **Geolocation integration** for finding nearby stores
- **Overpass API** for store data retrieval
- **Store filtering and categorization**
- **Distance calculations** and mapping

### Multi-Language Architecture
- **234+ translation keys** covering entire UI
- **Cultural localization** with region-specific content
- **Dynamic content translation** (recipes, ingredients, stores)
- **Language switcher** with flag emojis and smooth transitions

This application represents a comprehensive recipe management system with modern React patterns, extensive internationalization, and AI-powered recipe generation capabilities.