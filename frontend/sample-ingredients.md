# Sample Word Document Content for Testing

When you create a Word document (.docx) with ingredient lists, the parser will recognize these formats:

## Format Examples:

### Standard Format (Quantity + Unit + Ingredient):
```
2 cups flour
1 cup milk
3 tbsp olive oil
4 pieces chicken breast
1 tsp salt
2 cloves garlic
```

### Alternative Format (Ingredient: Quantity Unit):
```
Flour: 2 cups
Milk: 1 cup
Olive oil: 3 tbsp
Chicken breast: 4 pieces
Salt: 1 tsp
Garlic: 2 cloves
```

### Bulleted Lists:
```
• 2 cups flour
• 1 cup milk  
• 3 tbsp olive oil
- 4 pieces chicken breast
- 1 tsp salt
* 2 cloves garlic
```

### Mixed Format with Categories:
```
Proteins:
- 4 pieces chicken breast
- 2 eggs

Vegetables:  
- 2 cloves garlic
- 1 onion
- 2 tomatoes

Grains:
- 2 cups flour
- 1 cup rice

Dairy:
- 1 cup milk
- 2 tbsp butter
```

The intelligent parser will:
1. Extract ingredients with quantities and units
2. Automatically categorize ingredients (Proteins, Vegetables, Fruits, Grains, Dairy, etc.)
3. Handle various formats and bullet styles
4. Skip headers and non-ingredient text
5. Provide fallback values for ingredients without clear quantities

Copy this content into a Word document and save it as .docx to test the upload feature!