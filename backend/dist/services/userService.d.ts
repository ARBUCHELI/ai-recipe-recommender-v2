export interface UserPreferencesInput {
    dietaryRestrictions: string[];
    allergies: string[];
    favoriteCuisines: string[];
    dislikedCuisines: string[];
    cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferredMealTypes: string[];
    maxCookingTime: number;
    servingSize: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyRecipeEmails: boolean;
    recipeRecommendations: boolean;
    units: 'metric' | 'imperial';
    language: 'en' | 'es' | 'fr';
    theme: 'light' | 'dark' | 'system';
}
export interface ProfileUpdateInput {
    name: string;
    email: string;
}
export declare class UserService {
    static updateProfile(userId: string, profileData: ProfileUpdateInput): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        user?: undefined;
    }>;
    static updateAvatar(userId: string, avatarUrl: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        avatarUrl: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        user?: undefined;
        avatarUrl?: undefined;
    }>;
    static removeAvatar(userId: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        oldAvatarUrl: string | undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        user?: undefined;
        oldAvatarUrl?: undefined;
    }>;
    static getPreferences(userId: string): Promise<{
        success: boolean;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            dietaryRestrictions: string[];
            allergies: string[];
            favoriteCuisines: string[];
            dislikedCuisines: string[];
            cookingSkillLevel: string;
            preferredMealTypes: string[];
            maxCookingTime: number;
            servingSize: number;
            emailNotifications: boolean;
            pushNotifications: boolean;
            weeklyRecipeEmails: boolean;
            recipeRecommendations: boolean;
            units: string;
            language: string;
            theme: string;
        } | null;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        preferences: null;
    }>;
    static updatePreferences(userId: string, preferencesData: UserPreferencesInput): Promise<{
        success: boolean;
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            dietaryRestrictions: string[];
            allergies: string[];
            favoriteCuisines: string[];
            dislikedCuisines: string[];
            cookingSkillLevel: string;
            preferredMealTypes: string[];
            maxCookingTime: number;
            servingSize: number;
            emailNotifications: boolean;
            pushNotifications: boolean;
            weeklyRecipeEmails: boolean;
            recipeRecommendations: boolean;
            units: string;
            language: string;
            theme: string;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        preferences?: undefined;
    }>;
    static getUserProfile(userId: string): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            preferences: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                dietaryRestrictions: string[];
                allergies: string[];
                favoriteCuisines: string[];
                dislikedCuisines: string[];
                cookingSkillLevel: string;
                preferredMealTypes: string[];
                maxCookingTime: number;
                servingSize: number;
                emailNotifications: boolean;
                pushNotifications: boolean;
                weeklyRecipeEmails: boolean;
                recipeRecommendations: boolean;
                units: string;
                language: string;
                theme: string;
            } | null;
        };
        message?: undefined;
    }>;
}
//# sourceMappingURL=userService.d.ts.map