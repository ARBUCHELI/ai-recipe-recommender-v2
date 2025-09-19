import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  open,
  onOpenChange,
  onSwitchToSignIn
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  
  // Check if Google OAuth is configured
  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setValidationError(t('forms.validation.required'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError(t('forms.validation.passwordsDoNotMatch'));
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError(t('forms.validation.passwordTooShort'));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError(t('forms.validation.invalidEmail'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    setValidationError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const success = await register(formData.name.trim(), formData.email.trim(), formData.password);
    
    if (success) {
      // Reset form and close modal on success
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);
      onOpenChange(false);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setValidationError('');
      clearError();
    }
  }, [open, clearError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-border shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {t('forms.labels.createAccount', 'Create Account')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Google Sign In Section - only show if configured */}
          {isGoogleConfigured && (
            <>
              <GoogleSignInButton
                onSuccess={() => {
                  // Reset form and close modal on success
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  onOpenChange(false);
                }}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('forms.labels.orCreateWith', 'Or create account with email')}
                  </span>
                </div>
              </div>
            </>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">{t('forms.labels.name')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={t('forms.placeholders.enterName')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-foreground">{t('forms.labels.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder={t('forms.placeholders.enterEmail')}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-foreground">{t('forms.labels.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder={t('forms.placeholders.enterPassword')}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">{t('forms.labels.confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('forms.placeholders.confirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {(validationError || error) && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {validationError || error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary hover-lift transition-spring shadow-soft hover:shadow-glow"
            disabled={isLoading || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('forms.buttons.create')
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('forms.labels.haveAccount', 'Already have an account?')}{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {t('forms.buttons.login')}
              </button>
            </p>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};