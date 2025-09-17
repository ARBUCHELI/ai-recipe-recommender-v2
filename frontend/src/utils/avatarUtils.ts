const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Constructs the full avatar URL from a relative or absolute path
 * @param avatarUrl - The avatar URL (relative or absolute)
 * @returns Full avatar URL
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;
  
  // If it's already a full URL, return as-is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${avatarUrl}`;
};