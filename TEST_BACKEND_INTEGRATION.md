# Backend Integration Test Guide

## Quick Test Steps

To verify that the user-specific recipe system is working properly:

### 1. Start the Backend Server
```bash
cd backend
npm run dev
# or
yarn dev
```

### 2. Start the Frontend
```bash
cd frontend  
npm run dev
# or
yarn dev
```

### 3. Test User Authentication & Recipe Isolation

#### Test Case 1: User A Creates Recipes
1. **Sign up** as User A (e.g., `usera@test.com`)
2. **Upload ingredients** (any CSV/JSON or manual entry)
3. **Generate recipes** using the "Generate Recipe" button
4. **Verify recipes appear** in the "Recipes" tab
5. **Note the recipe count** in the navigation

#### Test Case 2: User A Logs Out
1. **Sign out** User A
2. **Go to Recipes tab** - should show "Please Sign In" message
3. **Verify recipes disappear** from the UI
4. **Recipe count should be 0** in navigation

#### Test Case 3: User B Creates Different Recipes  
1. **Sign up** as User B (e.g., `userb@test.com`)
2. **Upload different ingredients**
3. **Generate recipes** 
4. **Verify only User B's recipes appear**
5. **User A's recipes should NOT be visible**

#### Test Case 4: Switch Back to User A
1. **Sign out** User B
2. **Sign in** as User A again 
3. **Go to Recipes tab**
4. **Verify only User A's original recipes appear**
5. **User B's recipes should NOT be visible**

### 4. Test Backend API Directly

You can also test the API endpoints directly:

#### Get User's Recipes (requires authentication):
```bash
# Replace YOUR_JWT_TOKEN with actual token from browser localStorage
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/recipes
```

#### Create a Recipe:
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Recipe",
       "description": "A test recipe",
       "ingredients": ["2 cups flour", "1 egg"],
       "instructions": ["Mix ingredients", "Cook for 20 minutes"],
       "prepTime": 10,
       "cookTime": 20,
       "servings": 4
     }' \
     http://localhost:3001/api/recipes
```

#### Seed Ingredients:
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/ingredients/seed
```

### 5. Verify Database State

If you have access to your PostgreSQL database:

```sql
-- Check users table
SELECT id, name, email, "createdAt" FROM users;

-- Check recipes and their owners
SELECT r.id, r.name, r."userId", u.name as owner_name, r."createdAt"
FROM recipes r
JOIN users u ON r."userId" = u.id
ORDER BY r."createdAt" DESC;

-- Check ingredients table
SELECT name, category, unit FROM ingredients LIMIT 10;
```

## Expected Results ✅

**✅ PASS:** Each user only sees their own recipes  
**✅ PASS:** Recipes disappear when user logs out  
**✅ PASS:** Switching users shows different recipe sets  
**✅ PASS:** Generated recipes are saved to database  
**✅ PASS:** Recipe count in navigation is user-specific  
**✅ PASS:** AI-generated recipes auto-save to user's account  

## Troubleshooting Common Issues

### Issue: "Network error occurred"
- **Check:** Backend server is running on port 3001
- **Check:** Frontend is making requests to correct URL
- **Verify:** `VITE_API_BASE_URL` environment variable

### Issue: "User not authenticated" 
- **Check:** User is properly signed in
- **Check:** JWT token exists in localStorage (`auth_token`)
- **Verify:** Token is being sent in Authorization header

### Issue: "Recipes still showing after logout"
- **Check:** Frontend components are using `useAuth` hook
- **Check:** `AuthContext` is properly clearing data on logout
- **Verify:** LocalStorage is being cleared for the user

### Issue: "Same recipes showing for different users"
- **Check:** Backend routes are filtering by `userId`
- **Check:** Database recipes have proper `userId` foreign key
- **Verify:** RecipeService methods are user-scoped

### Issue: Ingredients not loading
- **Check:** Run `/api/ingredients/seed` endpoint first
- **Check:** Database has ingredients table with data
- **Verify:** Ingredient service is working

## Development Console Logs to Look For

### Successful Authentication:
```
📱 LocalStorage: Setting current user: cuid_user_id_here
🔗 Making recipe request to: http://localhost:3001/api/recipes
✅ Recipe success response: { success: true, recipes: [...] }
```

### User Logout Cleanup:
```
🧹 Clearing user data for: cuid_user_id_here
🗑️ Removing user-specific key: user_memory_cuid_user_id_here
```

### Recipe Creation:
```
🔗 Making recipe request to: http://localhost:3001/api/recipes
✅ Recipe success response: { success: true, recipe: {...} }
```

If all tests pass, the user-specific recipe system is working correctly! 🎉