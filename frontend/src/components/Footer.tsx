import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative py-12 px-4 bg-gradient-to-r from-muted/30 via-background to-muted/30 border-t border-border/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center space-y-3">
            <div className="gradient-primary p-2 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                AI-Powered App Designed by:
              </p>
              <p className="text-xl font-bold text-primary">
                Andrés R. Bucheli
              </p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground pt-4 border-t border-border/10">
            <span>© {new Date().getFullYear()}</span>
            <span>•</span>
            <span>All rights reserved</span>
            <span>•</span>
            <span className="font-medium">AI Recipe Recommender</span>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex justify-center space-x-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </footer>
  );
};