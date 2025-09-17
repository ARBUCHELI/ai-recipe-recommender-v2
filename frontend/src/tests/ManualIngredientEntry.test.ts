// Test scenarios for Manual Ingredient Entry feature

export interface TestIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

// Test data for different scenarios
export const testIngredients: TestIngredient[] = [
  // Basic protein
  {
    name: 'Chicken breast',
    quantity: 2,
    unit: 'pieces',
    category: 'Proteins'
  },
  // Vegetable with fractional quantity
  {
    name: 'Broccoli',
    quantity: 1.5,
    unit: 'cups',
    category: 'Vegetables'
  },
  // Spice with small measurement
  {
    name: 'Salt',
    quantity: 0.5,
    unit: 'tsp',
    category: 'Spices & Herbs'
  },
  // Liquid measurement
  {
    name: 'Olive oil',
    quantity: 2,
    unit: 'tbsp',
    category: 'Oils & Fats'
  }
];

// Validation test cases
export const validationTests = {
  valid: [
    { name: 'Tomato', quantity: '2', unit: 'pieces', category: 'Vegetables' },
    { name: 'Rice', quantity: '1.5', unit: 'cups', category: 'Grains' },
    { name: 'Garlic', quantity: '3', unit: 'cloves', category: 'Spices & Herbs' }
  ],
  invalid: [
    { name: '', quantity: '2', unit: 'pieces', category: 'Vegetables' }, // Empty name
    { name: 'Tomato', quantity: '', unit: 'pieces', category: 'Vegetables' }, // Empty quantity
    { name: 'Tomato', quantity: '0', unit: 'pieces', category: 'Vegetables' }, // Zero quantity
    { name: 'Tomato', quantity: '-1', unit: 'pieces', category: 'Vegetables' } // Negative quantity
  ]
};

// Test user flow scenarios
export const userFlowTests = [
  {
    name: 'Add single ingredient',
    steps: [
      'Click "Add Your First Ingredient" button',
      'Fill in ingredient name: "Chicken"',
      'Fill in quantity: "1"', 
      'Select unit: "lbs"',
      'Select category: "Proteins"',
      'Click "Add Ingredient"',
      'Verify ingredient appears in list'
    ]
  },
  {
    name: 'Add multiple ingredients',
    steps: [
      'Add first ingredient',
      'Click "Add Another Ingredient"',
      'Fill in second ingredient details',
      'Click "Add Ingredient"',
      'Verify both ingredients appear in list'
    ]
  },
  {
    name: 'Cancel ingredient entry',
    steps: [
      'Click "Add Your First Ingredient"',
      'Fill in some fields',
      'Click "Cancel"',
      'Verify form is reset and closed'
    ]
  },
  {
    name: 'Remove ingredient',
    steps: [
      'Add an ingredient',
      'Click remove button (X)',
      'Verify ingredient is removed from list'
    ]
  },
  {
    name: 'Keyboard shortcuts',
    steps: [
      'Click "Add Your First Ingredient"',
      'Fill in ingredient details',
      'Press Enter in any field',
      'Verify ingredient is added'
    ]
  }
];

// Expected behavior documentation
export const expectedBehaviors = {
  formValidation: {
    nameField: 'Required, cannot be empty or just whitespace',
    quantityField: 'Required, must be positive number, allows decimals',
    unitField: 'Required, must select from predefined options',
    categoryField: 'Required, must select from predefined options'
  },
  userInteraction: {
    submitButton: 'Disabled when required fields are empty',
    cancelButton: 'Resets form and closes entry mode',
    enterKey: 'Submits form from any field when valid',
    removeButton: 'Removes ingredient from list with confirmation'
  },
  dataProcessing: {
    ingredientObject: 'Creates proper Ingredient interface object',
    quantityParsing: 'Converts string to number correctly',
    nameTrimming: 'Removes leading/trailing whitespace',
    integration: 'Calls onIngredientsUpload with array containing single ingredient'
  }
};