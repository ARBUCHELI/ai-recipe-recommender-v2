import React, { createContext, useContext, useState, useEffect } from 'react';

// Import all translation files
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import fr from '@/translations/fr.json';
import de from '@/translations/de.json';
import ru from '@/translations/ru.json';

// Language configuration
export const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  ru: { name: 'Русский', flag: '🇷🇺' }
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Translations collection
const translations = {
  en,
  es,
  fr,
  de,
  ru
};

// Context interface
interface TranslationContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  resetToEnglish: () => void;
  languages: typeof LANGUAGES;
}

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Helper function to get nested object value by key path
const getNestedValue = (obj: any, path: string, fallback?: string): string => {
  const result = path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
  return result || fallback || path; // Return fallback, then key if translation not found
};

// Provider component
interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  // Initialize language - default to English with proper validation
  const initializeLanguage = (): LanguageCode => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app-language') as LanguageCode;
        // Validate saved language is supported
        if (saved && saved in LANGUAGES) {
          console.log(`Loaded language from localStorage: ${saved}`);
          return saved;
        } else {
          // Default to English if no valid saved language
          console.log('No valid saved language, defaulting to English');
          localStorage.setItem('app-language', 'en');
          return 'en';
        }
      } catch (error) {
        console.warn('Error with localStorage, defaulting to English:', error);
        localStorage.setItem('app-language', 'en');
      }
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(initializeLanguage);

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', currentLanguage);
    }
  }, [currentLanguage]);

  // Set language function
  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
  };

  // Reset to English function
  const resetToEnglish = () => {
    localStorage.setItem('app-language', 'en');
    setCurrentLanguage('en');
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const translation = getNestedValue(translations[currentLanguage], key, fallback);
    
    // Fallback to English if translation doesn't exist in current language
    if (translation === key && currentLanguage !== 'en') {
      return getNestedValue(translations.en, key, fallback);
    }
    
    return translation;
  };

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    t,
    resetToEnglish,
    languages: LANGUAGES
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation context
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};