/**
 * Distance Badge Color Schemes
 * Different high-visibility color options for the distance badge
 */

export interface BadgeColorScheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const BADGE_COLOR_SCHEMES: BadgeColorScheme[] = [
  {
    name: 'Bright Red',
    backgroundColor: '#ef4444', // red-500
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'High visibility red - excellent contrast on any background'
  },
  {
    name: 'Electric Blue',
    backgroundColor: '#3b82f6', // blue-500
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Professional blue - works great with most brand colors'
  },
  {
    name: 'Vibrant Orange',
    backgroundColor: '#f97316', // orange-500
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Eye-catching orange - very noticeable and friendly'
  },
  {
    name: 'Success Green',
    backgroundColor: '#10b981', // emerald-500
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Fresh green - suggests proximity and availability'
  },
  {
    name: 'Premium Purple',
    backgroundColor: '#8b5cf6', // violet-500
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Elegant purple - premium feel with great visibility'
  },
  {
    name: 'Classic Dark',
    backgroundColor: '#1f2937', // gray-800
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Professional dark gray - works with any design'
  },
  {
    name: 'Semi-Transparent Dark',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    description: 'Semi-transparent overlay - adapts to background while maintaining visibility'
  },
  {
    name: 'Gradient Sunset',
    backgroundColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    textColor: '#ffffff',
    borderColor: '#ffffff',
    description: 'Beautiful gradient - eye-catching and modern'
  }
];

/**
 * Get the default badge color scheme (currently Bright Red)
 */
export function getDefaultBadgeScheme(): BadgeColorScheme {
  return BADGE_COLOR_SCHEMES[0]; // Bright Red
}

/**
 * Get badge scheme by name
 */
export function getBadgeSchemeByName(name: string): BadgeColorScheme {
  return BADGE_COLOR_SCHEMES.find(scheme => scheme.name === name) || getDefaultBadgeScheme();
}

/**
 * Distance-based color selection - closer stores get more urgent colors
 */
export function getDistanceBasedBadgeScheme(distanceInMeters: number): BadgeColorScheme {
  if (distanceInMeters <= 500) {
    return getBadgeSchemeByName('Success Green'); // Very close - green
  } else if (distanceInMeters <= 1000) {
    return getBadgeSchemeByName('Electric Blue'); // Close - blue  
  } else if (distanceInMeters <= 2000) {
    return getBadgeSchemeByName('Vibrant Orange'); // Medium - orange
  } else {
    return getBadgeSchemeByName('Bright Red'); // Far - red
  }
}

/**
 * Generate CSS styles for badge
 */
export function getBadgeStyles(scheme: BadgeColorScheme): React.CSSProperties {
  return {
    backgroundColor: scheme.backgroundColor,
    color: scheme.textColor,
    borderColor: scheme.borderColor
  };
}