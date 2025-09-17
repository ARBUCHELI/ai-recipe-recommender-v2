import React from 'react';
import { Download, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
//import { Recipe } from '@/services/aiService';
import { Recipe } from '@/services/realAiService';
import { Categories } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface PDFExportProps {
  recipes: Recipe[];
  categories: Categories;
}

export const PDFExport: React.FC<PDFExportProps> = ({ recipes, categories }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    if (recipes.length === 0) {
      toast({
        title: "No Recipes",
        description: "Please generate some recipes before exporting.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Recipe Collection & Meal Plan', 20, yPosition);
      yPosition += 20;
      
      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Summary
      const totalNutrition = recipes.reduce((total, recipe) => ({
        calories: total.calories + recipe.nutrition.calories,
        protein: total.protein + recipe.nutrition.protein,
        carbs: total.carbs + recipe.nutrition.carbs,
        fat: total.fat + recipe.nutrition.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      pdf.setFontSize(14);
      pdf.text('Nutrition Summary (Total)', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.text(`Calories: ${totalNutrition.calories} | Protein: ${totalNutrition.protein}g | Carbs: ${totalNutrition.carbs}g | Fat: ${totalNutrition.fat}g`, 20, yPosition);
      yPosition += 20;

      // Recipes
      recipes.forEach((recipe, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text(`${index + 1}. ${recipe.name}`, 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Prep: ${recipe.prepTime}min | Cook: ${recipe.cookTime}min | Servings: ${recipe.servings}`, 20, yPosition);
        yPosition += 10;

        // Ingredients
        pdf.setFontSize(12);
        pdf.text('Ingredients:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        recipe.ingredients.forEach(ingredient => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`• ${ingredient}`, 25, yPosition);
          yPosition += 6;
        });
        
        yPosition += 5;

        // Instructions
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text('Instructions:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        recipe.instructions.forEach((instruction, idx) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          const lines = pdf.splitTextToSize(`${idx + 1}. ${instruction}`, 170);
          lines.forEach(line => {
            pdf.text(line, 25, yPosition);
            yPosition += 6;
          });
        });

        yPosition += 15;
      });

      // Shopping List
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.text('Shopping List', 20, yPosition);
      yPosition += 15;

      const allIngredients = new Set();
      recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          allIngredients.add(ingredient);
        });
      });

      const ingredientsByCategory = {};
      Array.from(allIngredients).forEach(ingredient => {
        const category = categorizeIngredient(ingredient as string, categories);
        if (!ingredientsByCategory[category]) {
          ingredientsByCategory[category] = [];
        }
        ingredientsByCategory[category].push(ingredient);
      });

      Object.entries(ingredientsByCategory).forEach(([category, items]) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text(category, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        (items as string[]).forEach(item => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`☐ ${item}`, 25, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      });

      // Save the PDF
      pdf.save('recipe-collection.pdf');
      
      toast({
        title: "PDF Generated",
        description: "Your recipe collection has been downloaded successfully!"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const categorizeIngredient = (ingredient: string, categories: Categories): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerIngredient.includes(item.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Other';
  };

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader className="gradient-accent text-accent-foreground">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export PDF
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Export your recipes, meal plans, nutrition information, and shopping list as a comprehensive PDF document.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Your PDF will include:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All generated recipes with ingredients and instructions</li>
              <li>• Complete nutrition information and summaries</li>
              <li>• Organized shopping list by category</li>
              <li>• Preparation and cooking times</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} ready for export
            </div>
            
            <Button
              onClick={generatePDF}
              disabled={isGenerating || recipes.length === 0}
              className="gradient-primary"
            >
              {isGenerating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};