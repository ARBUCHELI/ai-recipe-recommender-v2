import React, { useState } from 'react';
import { User, LogOut, Settings, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { PreferencesModal } from './PreferencesModal';
import { getAvatarUrl } from '@/utils/avatarUtils';

export const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('profile.greeting.morning', 'Good morning');
    if (hour < 17) return t('profile.greeting.afternoon', 'Good afternoon');
    return t('profile.greeting.evening', 'Good evening');
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full ring-2 ring-neutral-200 hover:ring-brand-primary transition-all duration-300"
        >
          <Avatar className="h-10 w-10 shadow-professional-md">
            {getAvatarUrl(user.avatarUrl) && (
            <AvatarImage 
              src={getAvatarUrl(user.avatarUrl)} 
              alt={`${user.name}'s profile picture`}
              className="avatar-image-perfect"
            />
            )}
            <AvatarFallback className="btn-primary text-white font-semibold text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-2 bg-card border-neutral shadow-professional-lg" align="end">
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <p className="text-sm font-medium text-primary-dark">
                {getTimeBasedGreeting()}, {user.name.split(' ')[0]}! 👋
              </p>
            </div>
            <p className="text-xs text-secondary-dark font-normal">
              {user.email}
            </p>
            <div className="flex items-center space-x-1 mt-2">
              <Crown className="h-3 w-3 text-warning" />
              <span className="text-xs text-warning font-medium">
                {t('profile.premiumChef', 'Premium Chef')}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-neutral-50 rounded-lg transition-colors p-2"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <User className="mr-3 h-4 w-4 text-brand-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary-dark">{t('profile.menu.settings', 'Profile Settings')}</span>
            <span className="text-xs text-secondary-dark">{t('profile.menu.manageAccount', 'Manage your account')}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-neutral-50 rounded-lg transition-colors p-2"
          onClick={() => setIsPreferencesModalOpen(true)}
        >
          <Settings className="mr-3 h-4 w-4 text-brand-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary-dark">{t('profile.menu.preferences', 'Preferences')}</span>
            <span className="text-xs text-secondary-dark">{t('profile.menu.customize', 'Customize your experience')}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-error/10 hover:text-error rounded-lg transition-colors p-2"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t('forms.buttons.logout')}</span>
            <span className="text-xs text-secondary-dark opacity-70">{t('profile.menu.seeYouSoon', 'See you soon!')}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
    {/* Modals */}
    <ProfileSettingsModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
    />
    
    <PreferencesModal
      isOpen={isPreferencesModalOpen}
      onClose={() => setIsPreferencesModalOpen(false)}
    />
    </>
  );
};
