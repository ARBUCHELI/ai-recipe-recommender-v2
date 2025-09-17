import React, { useState } from 'react';
import { ArrowRight, Upload, Sparkles, Calendar, ShoppingCart, Download, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import foodBackgroundImg from '@/assets/food-background.jpg';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [showSampleRecipe, setShowSampleRecipe] = useState(false);
  const { t } = useTranslation();

  const sampleRecipe = {
    name: t('homepage.sampleRecipe.name'),
    description: t('homepage.sampleRecipe.description'),
    prepTime: t('homepage.sampleRecipe.prepTime'),
    servings: 4,
    ingredients: t('homepage.sampleRecipe.ingredientsList'),
    instructions: t('homepage.sampleRecipe.instructionsList'),
    nutrition: {
      calories: 285,
      protein: 12,
      fat: 14,
      carbs: 32
    }
  };
  const features = [
    {
      icon: Upload,
      title: t('homepage.features.smartInput.title'),
      description: t('homepage.features.smartInput.description')
    },
    {
      icon: Sparkles,
      title: t('homepage.features.aiRecipes.title'),
      description: t('homepage.features.aiRecipes.description')
    },
    {
      icon: Calendar,
      title: t('homepage.features.mealPlanning.title'),
      description: t('homepage.features.mealPlanning.description')
    },
    {
      icon: ShoppingCart,
      title: t('homepage.features.shoppingLists.title'),
      description: t('homepage.features.shoppingLists.description')
    },
    {
      icon: Download,
      title: t('homepage.features.pdfExport.title'),
      description: t('homepage.features.pdfExport.description')
    }
  ];

  const testimonials = [
    {
      name: t('homepage.testimonials.sarah.name'),
      role: t('homepage.testimonials.sarah.role'),
      content: t('homepage.testimonials.sarah.content'),
      rating: 5
    },
    {
      name: t('homepage.testimonials.mike.name'),
      role: t('homepage.testimonials.mike.role'), 
      content: t('homepage.testimonials.mike.content'),
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-12 sm:py-16 md:py-20 px-4 text-center"
        style={{
          backgroundImage: `linear-gradient(135deg, 
            hsla(50, 40%, 98%, 0.6) 0%, 
            hsla(50, 40%, 98%, 0.5) 50%, 
            hsla(50, 40%, 98%, 0.6) 100%), url(${foodBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
        }}
      >
        <div className="max-w-4xl mx-auto">
          
          <div className="btn-primary p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-6 sm:mb-8 shadow-professional-lg">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark mb-4 sm:mb-6 leading-tight px-2">
            {t('homepage.hero.title')}
            <span className="text-brand-primary block mt-1 sm:mt-2">
              {t('homepage.hero.titleHighlight')}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-secondary-dark mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 font-medium">
            {t('homepage.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-professional-lg transition-all duration-300 w-full sm:w-auto font-semibold"
            >
              {t('homepage.hero.getStartedButton')}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Dialog open={showSampleRecipe} onOpenChange={setShowSampleRecipe}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-neutral text-secondary-dark hover:bg-neutral-50 hover:border-brand shadow-professional-md transition-all duration-300 w-full sm:w-auto font-medium"
                >
                  {t('homepage.hero.viewSampleButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    {sampleRecipe.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <p className="text-muted-foreground text-lg">{sampleRecipe.description}</p>
                  
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{sampleRecipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{sampleRecipe.servings} {t('homepage.sampleRecipe.servings')}</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('homepage.sampleRecipe.ingredients')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {sampleRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('homepage.sampleRecipe.instructions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {sampleRecipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('homepage.sampleRecipe.nutrition')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{sampleRecipe.nutrition.calories}</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.meals.calories')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{sampleRecipe.nutrition.protein}g</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.meals.protein')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{sampleRecipe.nutrition.fat}g</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.meals.fat')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{sampleRecipe.nutrition.carbs}g</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.meals.carbs')}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              {t('homepage.features.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              {t('homepage.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* First row: 3 cards */}
            {features.slice(0, 3).map((feature, index) => (
              <Card key={index} className="group hover:shadow-professional-lg transition-all duration-300 border-neutral bg-card shadow-professional-md">
                <CardHeader className="text-center pb-4">
                  <div className="btn-primary p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-primary-dark">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-dark text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Second row: 2 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            {features.slice(3, 5).map((feature, index) => (
              <Card key={index + 3} className="group hover:shadow-professional-lg transition-all duration-300 border-neutral bg-card shadow-professional-md">
                <CardHeader className="text-center pb-4">
                  <div className="btn-primary p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-primary-dark">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-dark text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        className="py-20 px-4 overflow-safe"
        style={{
          backgroundImage: `linear-gradient(135deg, 
            hsla(50, 40%, 98%, 0.7) 0%, 
            hsla(50, 40%, 98%, 0.6) 50%, 
            hsla(50, 40%, 98%, 0.7) 100%), url(${foodBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative overflow-x-hidden">
          <h2 className="text-4xl font-bold text-primary-dark mb-4">
            {t('homepage.howItWorks.title')}
          </h2>
          <p className="text-xl text-secondary-dark mb-16 font-medium">
            {t('homepage.howItWorks.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "1", 
                title: t('homepage.howItWorks.step1.title'), 
                description: t('homepage.howItWorks.step1.description')
              },
              { 
                step: "2", 
                title: t('homepage.howItWorks.step2.title'), 
                description: t('homepage.howItWorks.step2.description')
              },
              { 
                step: "3", 
                title: t('homepage.howItWorks.step3.title'), 
                description: t('homepage.howItWorks.step3.description')
              }
            ].map((item, index) => (
              <div key={index} className="relative p-6 rounded-2xl bg-card shadow-professional-md border border-neutral">
                <div className="btn-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-professional-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-primary-dark mb-4">{item.title}</h3>
                <p className="text-secondary-dark leading-relaxed">{item.description}</p>
                
                {index < 2 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-6 h-6 w-6 text-brand-primary opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              {t('homepage.testimonials.title')}
            </h2>
            <p className="text-xl text-secondary-dark font-medium">
              {t('homepage.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-professional-lg transition-all duration-300 bg-card border-neutral shadow-professional-md">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-secondary-dark mb-6 leading-relaxed italic font-medium">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-primary-dark">{testimonial.name}</p>
                    <p className="text-sm text-secondary-dark">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-brand-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white px-2">
            {t('homepage.cta.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 px-2 font-medium">
            {t('homepage.cta.subtitle')}
          </p>
          
          <Button 
            size="lg"
            onClick={onGetStarted}
            className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-white text-primary-dark hover:bg-white/95 shadow-professional-lg transition-all duration-300 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto font-semibold"
          >
            {t('homepage.cta.button')}
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>

    </div>
  );
};
