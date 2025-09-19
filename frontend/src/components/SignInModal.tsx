import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  open,
  onOpenChange,
  onSwitchToSignUp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  
  // Check if Google OAuth is configured
  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      // Reset form and close modal on success
      setEmail('');
      setPassword('');
      setShowPassword(false);
      onOpenChange(false);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      clearError();
    }
  }, [open, clearError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-border shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {t('forms.labels.welcomeBack', 'Welcome Back')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Google Sign In Section - only show if configured */}
          {isGoogleConfigured && (
            <>
              <GoogleSignInButton
                onSuccess={() => {
                  // Reset form and close modal on success
                  setEmail('');
                  setPassword('');
                  setShowPassword(false);
                  onOpenChange(false);
                }}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('forms.labels.orContinueWith', 'Or continue with email')}
                  </span>
                </div>
              </div>
            </>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">{t('forms.labels.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('forms.placeholders.enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">{t('forms.labels.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('forms.placeholders.enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <Button
            type="submit"
            className="w-full gradient-primary hover-lift transition-spring shadow-soft hover:shadow-glow"
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('forms.buttons.login')
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('forms.labels.noAccount', "Don't have an account?")}{" "}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {t('forms.buttons.register')}
              </button>
            </p>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};