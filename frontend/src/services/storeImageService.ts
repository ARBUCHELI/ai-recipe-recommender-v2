/**
 * Store Image Service
 * Provides store brand icons and beautiful fallback images for supermarket cards
 */

import { NearbyStore } from './overpassService';

// Store brand configurations with colors for consistent theming
export interface StoreBrandConfig {
  name: string;
  color: string;
  backgroundColor: string;
  icon?: string; // For future logo integration
  patterns: string[]; // Name patterns to match
}

// Popular supermarket chains with delicious food-inspired colors
export const STORE_BRANDS: StoreBrandConfig[] = [
  // US Chains
  {
    name: 'Walmart',
    color: '#d97706', // Warm amber-orange
    backgroundColor: '#fef3c7', // Light amber background
    patterns: ['walmart', 'wal-mart']
  },
  {
    name: 'Target',
    color: '#92400e', // Rich brown (like chocolate)
    backgroundColor: '#fef3c7', // Light amber background
    patterns: ['target']
  },
  {
    name: 'Kroger',
    color: '#059669', // Fresh green (like fresh herbs)
    backgroundColor: '#ecfdf5', // Light green background
    patterns: ['kroger']
  },
  {
    name: 'Safeway',
    color: '#ea580c', // Warm orange-red (like paprika)
    backgroundColor: '#fff7ed', // Light orange background
    patterns: ['safeway']
  },
  {
    name: 'Whole Foods',
    color: '#16a34a', // Natural green (like spinach)
    backgroundColor: '#f0fdf4', // Very light green
    patterns: ['whole foods', 'wholefoods']
  },
  {
    name: 'Costco',
    color: '#0369a1', // Deep blue (like blueberries)
    backgroundColor: '#f0f9ff', // Light blue background
    patterns: ['costco']
  },
  {
    name: 'H-E-B',
    color: '#a16207', // Golden brown (like caramel)
    backgroundColor: '#fef3c7', // Light amber background
    patterns: ['h-e-b', 'heb']
  },
  // European Chains
  {
    name: 'Tesco',
    color: '#0369a1', // Ocean blue (like fish)
    backgroundColor: '#f0f9ff', // Light blue background
    patterns: ['tesco']
  },
  {
    name: 'ASDA',
    color: '#65a30d', // Olive green (like olives)
    backgroundColor: '#f7fee7', // Light olive background
    patterns: ['asda']
  },
  {
    name: 'Carrefour',
    color: '#0891b2', // Seafoam teal (like ocean herbs)
    backgroundColor: '#f0fdfa', // Light teal background
    patterns: ['carrefour']
  },
  {
    name: 'Lidl',
    color: '#15803d', // Forest green (like sage)
    backgroundColor: '#f0fdf4', // Light green background
    patterns: ['lidl']
  },
  {
    name: 'ALDI',
    color: '#f97316', // Pumpkin orange
    backgroundColor: '#fff7ed', // Light orange background
    patterns: ['aldi']
  },
  {
    name: 'Metro',
    color: '#0891b2', // Teal (like seafoam)
    backgroundColor: '#f0fdfa', // Light teal background
    patterns: ['metro']
  },
  // Generic types with delicious food-inspired colors
  {
    name: 'Supermarket',
    color: '#d97706', // Golden amber (like honey)
    backgroundColor: '#fef3c7', // Light amber background
    patterns: ['supermarket', 'super market']
  },
  {
    name: 'Hypermarket',
    color: '#ea580c', // Warm orange (like carrots)
    backgroundColor: '#fff7ed', // Light orange background
    patterns: ['hypermarket', 'hyper market']
  },
  {
    name: 'Grocery',
    color: '#16a34a', // Fresh green (like lettuce)
    backgroundColor: '#f0fdf4', // Light green background
    patterns: ['grocery', 'groceries']
  },
  {
    name: 'Convenience',
    color: '#c2410c', // Warm cinnamon (like spices)
    backgroundColor: '#fff7ed', // Light orange background
    patterns: ['convenience', '7-eleven', '7eleven', 'circle k']
  },
  {
    name: 'Organic',
    color: '#84cc16', // Lime green (like fresh herbs)
    backgroundColor: '#f7fee7', // Very light lime background
    patterns: ['organic', 'natural', 'health']
  }
];

// Fallback configurations by store type with food-inspired colors
export const STORE_TYPE_CONFIGS: Record<string, StoreBrandConfig> = {
  supermarket: {
    name: 'Supermarket',
    color: '#d97706', // Golden amber
    backgroundColor: '#fef3c7',
    patterns: []
  },
  hypermarket: {
    name: 'Hypermarket', 
    color: '#ea580c', // Warm orange
    backgroundColor: '#fff7ed',
    patterns: []
  },
  grocery: {
    name: 'Grocery Store',
    color: '#16a34a', // Fresh green
    backgroundColor: '#f0fdf4',
    patterns: []
  },
  convenience: {
    name: 'Convenience Store',
    color: '#c2410c', // Warm cinnamon
    backgroundColor: '#fff7ed',
    patterns: []
  },
  organic: {
    name: 'Organic Store',
    color: '#84cc16', // Lime green
    backgroundColor: '#f7fee7',
    patterns: []
  },
  default: {
    name: 'Store',
    color: '#92400e', // Warm brown (like coffee)
    backgroundColor: '#fef3c7', // Light amber background
    patterns: []
  }
};

/**
 * Get store brand configuration by matching store name
 */
export function getStoreBrandConfig(store: NearbyStore): StoreBrandConfig {
  const storeName = store.name.toLowerCase();
  
  // Try to match against known brands first
  for (const brand of STORE_BRANDS) {
    for (const pattern of brand.patterns) {
      if (storeName.includes(pattern.toLowerCase())) {
        return brand;
      }
    }
  }
  
  // Fall back to store type configuration
  const typeConfig = STORE_TYPE_CONFIGS[store.storeType] || STORE_TYPE_CONFIGS.default;
  return typeConfig;
}

/**
 * Generate beautiful SVG icon for store
 */
export function generateStoreIcon(config: StoreBrandConfig, size: number = 48): string {
  // Create different icon styles based on store type
  const iconType = getIconTypeFromName(config.name);
  
  return `data:image/svg+xml;base64,${btoa(createStoreSVG(iconType, config, size))}`;
}

function getIconTypeFromName(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('hypermarket')) return 'hypermarket';
  if (nameLower.includes('convenience')) return 'convenience';
  if (nameLower.includes('organic') || nameLower.includes('health')) return 'organic';
  if (nameLower.includes('grocery')) return 'grocery';
  
  return 'supermarket'; // default
}

function createStoreSVG(iconType: string, config: StoreBrandConfig, size: number): string {
  const { color, backgroundColor } = config;
  
  const baseProps = `width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"`;
  
  switch (iconType) {
    case 'hypermarket':
      return `<svg ${baseProps}>
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="12" fill="url(#bg1)"/>
        <!-- Store building -->
        <rect x="8" y="20" width="32" height="20" rx="2" fill="${color}" opacity="0.8"/>
        <rect x="12" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="20" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="28" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="16" y="32" width="6" height="8" rx="1" fill="${color}"/>
        <!-- Shopping cart -->
        <g transform="translate(26, 28)">
          <rect x="0" y="4" width="12" height="8" rx="2" fill="none" stroke="${color}" stroke-width="2"/>
          <circle cx="3" cy="15" r="2" fill="${color}"/>
          <circle cx="9" cy="15" r="2" fill="${color}"/>
          <path d="M0 0 L2 0 L4 4 L12 4" fill="none" stroke="${color}" stroke-width="2"/>
        </g>
      </svg>`;
      
    case 'convenience':
      return `<svg ${baseProps}>
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="12" fill="url(#bg2)"/>
        <!-- Store front -->
        <rect x="12" y="16" width="24" height="20" rx="2" fill="${color}" opacity="0.8"/>
        <rect x="16" y="20" width="3" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="21" y="20" width="3" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="26" y="20" width="3" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="20" y="28" width="4" height="8" rx="1" fill="${backgroundColor}"/>
        <!-- Clock/24h indicator -->
        <circle cx="32" cy="12" r="6" fill="${color}" opacity="0.9"/>
        <text x="32" y="16" text-anchor="middle" fill="${backgroundColor}" font-size="8" font-weight="bold">24</text>
      </svg>`;
      
    case 'organic':
      return `<svg ${baseProps}>
        <defs>
          <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="12" fill="url(#bg3)"/>
        <!-- Store building -->
        <rect x="10" y="20" width="28" height="16" rx="2" fill="${color}" opacity="0.8"/>
        <rect x="14" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="22" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="30" y="24" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="20" y="30" width="5" height="6" rx="1" fill="${backgroundColor}"/>
        <!-- Organic leaf -->
        <g transform="translate(14, 8)">
          <ellipse cx="10" cy="8" rx="8" ry="6" fill="${color}" opacity="0.9"/>
          <path d="M6 8 Q10 4 14 8 Q10 12 6 8" fill="${backgroundColor}"/>
          <line x1="10" y1="8" x2="10" y2="14" stroke="${color}" stroke-width="2" opacity="0.7"/>
        </g>
      </svg>`;
      
    case 'grocery':
      return `<svg ${baseProps}>
        <defs>
          <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="12" fill="url(#bg4)"/>
        <!-- Store building -->
        <rect x="8" y="18" width="32" height="18" rx="2" fill="${color}" opacity="0.8"/>
        <rect x="12" y="22" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="20" y="22" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="28" y="22" width="4" height="3" rx="1" fill="${backgroundColor}"/>
        <rect x="18" y="28" width="6" height="8" rx="1" fill="${backgroundColor}"/>
        <!-- Fruits/vegetables -->
        <circle cx="16" cy="12" r="3" fill="${color}" opacity="0.9"/>
        <circle cx="24" cy="10" r="3" fill="${color}" opacity="0.7"/>
        <circle cx="32" cy="12" r="3" fill="${color}" opacity="0.9"/>
      </svg>`;
      
    default: // supermarket
      return `<svg ${baseProps}>
        <defs>
          <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="12" fill="url(#bg5)"/>
        <!-- Store building -->
        <rect x="6" y="16" width="36" height="20" rx="2" fill="${color}" opacity="0.8"/>
        <rect x="10" y="20" width="4" height="4" rx="1" fill="${backgroundColor}"/>
        <rect x="18" y="20" width="4" height="4" rx="1" fill="${backgroundColor}"/>
        <rect x="26" y="20" width="4" height="4" rx="1" fill="${backgroundColor}"/>
        <rect x="34" y="20" width="4" height="4" rx="1" fill="${backgroundColor}"/>
        <rect x="20" y="28" width="8" height="8" rx="1" fill="${backgroundColor}"/>
        <!-- Shopping basket -->
        <g transform="translate(30, 8)">
          <rect x="0" y="2" width="10" height="6" rx="2" fill="none" stroke="${color}" stroke-width="1.5"/>
          <path d="M2 2 L8 2" stroke="${color}" stroke-width="1"/>
          <circle cx="2" cy="10" r="1" fill="${color}"/>
          <circle cx="8" cy="10" r="1" fill="${color}"/>
        </g>
      </svg>`;
  }
}

/**
 * Get store image URL - for now returns generated SVG, 
 * but can be extended to fetch real store photos from APIs
 */
export function getStoreImageUrl(store: NearbyStore, size: number = 48): string {
  const config = getStoreBrandConfig(store);
  return generateStoreIcon(config, size);
}

/**
 * Get store theme colors for consistent UI styling
 */
export function getStoreTheme(store: NearbyStore) {
  const config = getStoreBrandConfig(store);
  return {
    color: config.color,
    backgroundColor: config.backgroundColor,
    name: config.name
  };
}