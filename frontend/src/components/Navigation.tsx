import React, { useState } from 'react';
import { ChefHat, Upload, BookOpen, ShoppingCart, Settings, Download, Home, Menu, X, LogIn, UserPlus, Heart, Star, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInModal } from './SignInModal';
import { SignUpModal } from './SignUpModal';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export type TabType = 'home' | 'upload' | 'recipes' | 'shopping' | 'health' | 'reviews' | 'analytics' | 'admin' | 'export';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  recipeCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  recipeCount
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { id: 'home' as TabType, label: t('navigation.home'), icon: Home, iconColor: 'text-brand-primary' },
    { id: 'upload' as TabType, label: t('navigation.upload', 'Upload'), icon: Upload, iconColor: 'text-success' },
    { id: 'recipes' as TabType, label: t('navigation.recipes', 'Recipes'), icon: BookOpen, badge: recipeCount > 0 ? recipeCount : undefined, iconColor: 'text-warning' },
    { id: 'shopping' as TabType, label: t('navigation.shopping', 'Shopping'), icon: ShoppingCart, iconColor: 'text-info' },
    { id: 'health' as TabType, label: t('navigation.health', 'Health'), icon: Heart, iconColor: 'text-red-500' },
    { id: 'reviews' as TabType, label: t('navigation.reviews', 'Reviews'), icon: Star, iconColor: 'text-warning' },
    { id: 'analytics' as TabType, label: t('navigation.analytics', 'Analytics'), icon: BarChart3, iconColor: 'text-blue-600' },
    { id: 'admin' as TabType, label: t('navigation.admin', 'Admin'), icon: Settings, iconColor: 'text-secondary-dark' },
    { id: 'export' as TabType, label: t('navigation.export', 'Export'), icon: Download, iconColor: 'text-error' }
  ];

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const handleSignInOpen = () => {
    setShowSignIn(true);
    setIsMobileMenuOpen(false);
  };

  const handleSignUpOpen = () => {
    setShowSignUp(true);
    setIsMobileMenuOpen(false);
  };

  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <>
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* First Line: Logo + App Name */}
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="btn-primary p-2 rounded-lg shadow-professional-md hover:shadow-professional-lg transition-all duration-300 hover:scale-105">
                <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-primary-dark flex items-baseline gap-2 sm:gap-3">
                <span>NutriAgent</span>
                <span className="text-xs xs:text-sm text-muted-foreground font-medium">
                  <span className="hidden sm:inline">AI Health & Meal Planning Assistant</span>
                  <span className="sm:hidden">AI Health Assistant</span>
                </span>
              </h1>
            </div>
            
            {/* Mobile Menu Button - Show on smaller screens */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Second Line: Navigation Only (Desktop Only) */}
          <div className="hidden lg:block py-2">
            <nav className="flex justify-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative hover:scale-105 transition-transform whitespace-nowrap ${item.badge ? 'pr-8' : ''}`}
                  size="sm"
                >
                  <item.icon className={`h-4 w-4 mr-2 ${activeTab === item.id ? 'text-white' : item.iconColor}`} />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-professional-sm font-medium">
                      {item.badge}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* Third Line: Language + Auth (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-end py-2 border-t border-border/50">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Section */}
            <div className="flex items-center space-x-2 pl-3 border-l border-border ml-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-medium text-foreground">
                      {t('forms.labels.welcomeBack', 'Welcome back!')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.name}
                    </span>
                  </div>
                  <UserProfileDropdown />
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignInOpen}
                    className="flex items-center border-neutral text-secondary-dark hover:bg-neutral-50 hover:border-brand transition-all duration-300 shadow-professional-sm hover:shadow-professional-md"
                  >
                    <LogIn className="h-4 w-4 mr-2 text-brand-primary" />
                    {t('forms.buttons.login')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSignUpOpen}
                    className="btn-primary flex items-center shadow-professional-md hover:shadow-professional-lg transition-all duration-300 text-white font-medium"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('forms.buttons.register')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-border bg-card">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Navigation Items */}
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => handleTabChange(item.id)}
                    className="w-full justify-start relative hover:scale-105 transition-transform"
                  >
                    <item.icon className={`h-4 w-4 mr-3 ${activeTab === item.id ? 'text-white' : item.iconColor}`} />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto mr-4 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-professional-sm font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                ))}
                
                {/* Mobile Language Switcher */}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
                
                {/* Mobile Auth Section */}
                <div className="border-t border-border pt-3 mt-3">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg glass">
                        <UserProfileDropdown />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleSignInOpen}
                        className="w-full justify-start border-neutral text-secondary-dark hover:bg-neutral-50 hover:border-brand transition-all duration-300 shadow-professional-sm"
                      >
                        <LogIn className="h-4 w-4 mr-3 text-saffron" />
                        {t('forms.buttons.login')}
                      </Button>
                      <Button
                        onClick={handleSignUpOpen}
                        className="w-full justify-start gradient-berry hover-lift transition-spring text-white"
                      >
                        <UserPlus className="h-4 w-4 mr-3" />
                        {t('forms.buttons.register')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Modals */}
      <SignInModal
        open={showSignIn}
        onOpenChange={setShowSignIn}
        onSwitchToSignUp={switchToSignUp}
      />
      <SignUpModal
        open={showSignUp}
        onOpenChange={setShowSignUp}
        onSwitchToSignIn={switchToSignIn}
      />
    </>
  );
};
