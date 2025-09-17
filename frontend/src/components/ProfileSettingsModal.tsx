import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { AvatarUpload } from './AvatarUpload';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
      setCurrentAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  }, [isOpen]);

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = t('forms.validation.required');
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = t('profile.validation.nameTooShort', 'Name must be at least 2 characters');
    }

    if (!profileData.email.trim()) {
      newErrors.email = t('forms.validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = t('forms.validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('forms.validation.required');
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t('forms.validation.required');
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = t('forms.validation.passwordTooShort');
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t('profile.validation.confirmPasswordRequired', 'Please confirm your new password');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('forms.validation.passwordsDoNotMatch');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = t('profile.validation.passwordMustBeDifferent', 'New password must be different from current password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        await refreshUser();
        toast({
          title: t('messages.success.updated'),
          description: t('profile.messages.profileUpdated', 'Your profile information has been updated successfully.'),
        });
      } else {
        toast({
          title: t('messages.errors.generic'),
          description: response.message || t('profile.messages.profileUpdateFailed', 'Failed to update profile'),
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsUpdatingPassword(true);
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        toast({
          title: t('messages.success.updated'),
          description: t('profile.messages.passwordChanged', 'Your password has been updated successfully.'),
        });
      } else {
        toast({
          title: "Password Change Failed",
          description: response.message || "Failed to change password",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10 rounded-2xl">
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-2xl -m-6 mb-0"></div>
          <div className="relative z-10">
            <DialogTitle className="flex items-center space-x-3 text-lg font-semibold">
              <div className="p-2 bg-primary/10 rounded-lg backdrop-blur-sm">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t('profile.menu.settings')}
              </span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground/80">
              {t('profile.description', 'Manage your account information and security settings')}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm border border-white/10 rounded-xl p-1">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm data-[state=active]:border-white/20 rounded-lg transition-all duration-300"
            >
              {t('profile.tabs.info', 'Profile Info')}
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm data-[state=active]:border-white/20 rounded-lg transition-all duration-300"
            >
              {t('profile.tabs.security', 'Security')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl"></div>
              <div className="relative flex flex-col items-center space-y-4 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg">
                <div className="relative">
                  <AvatarUpload
                    currentAvatarUrl={currentAvatarUrl}
                    userInitials={getInitials(user.name)}
                    onAvatarUpdate={(avatarUrl) => {
                      setCurrentAvatarUrl(avatarUrl);
                      // Optionally refresh user data
                      refreshUser();
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{user.name}</p>
                  <p className="text-muted-foreground/80 text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/20" />

            {/* Profile Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
              <div className="relative space-y-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shadow-inner">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/90 font-medium">{t('forms.labels.name')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('forms.placeholders.enterName')}
                    className={`${errors.name ? "border-destructive" : "border-white/20"} bg-white/30 backdrop-blur-sm focus:bg-white/40 transition-all duration-300`}
                  />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/90 font-medium">{t('forms.labels.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('forms.placeholders.enterEmail')}
                    className={`${errors.email ? "border-destructive" : "border-white/20"} bg-white/30 backdrop-blur-sm focus:bg-white/40 transition-all duration-300`}
                  />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('common.loading')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>{t('forms.buttons.update')}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl"></div>
              <form onSubmit={handleChangePassword} className="relative space-y-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shadow-inner">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground/90 font-medium">{t('profile.labels.currentPassword', 'Current Password')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder={t('profile.placeholders.currentPassword', 'Enter your current password')}
                      className={`${errors.currentPassword ? "border-destructive" : "border-white/20"} bg-white/30 backdrop-blur-sm focus:bg-white/40 transition-all duration-300 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground/90 font-medium">{t('profile.labels.newPassword', 'New Password')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder={t('profile.placeholders.newPassword', 'Enter your new password')}
                      className={`${errors.newPassword ? "border-destructive" : "border-white/20"} bg-white/30 backdrop-blur-sm focus:bg-white/40 transition-all duration-300 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground/90 font-medium">{t('forms.labels.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder={t('forms.placeholders.confirmPassword')}
                      className={`${errors.confirmPassword ? "border-destructive" : "border-white/20"} bg-white/30 backdrop-blur-sm focus:bg-white/40 transition-all duration-300 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border-white/20 hover:scale-[1.02]"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.updating')}
                    </>
                  ) : (
                    t('auth.updatePassword')
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal;
