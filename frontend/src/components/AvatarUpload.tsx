import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCw, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarUrl } from '@/utils/avatarUtils';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userInitials: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userInitials,
  onAvatarUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  }>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    scale: 1,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
        setIsPreviewOpen(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast]);

  const handleCropImage = useCallback((): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const img = new Image();
      
      img.onload = () => {
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas size to desired output size (e.g., 200x200)
        const outputSize = 200;
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Calculate crop dimensions for better circular avatar fitting
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        
        // Use the center crop approach for better circular avatars
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const sourceX = (img.naturalWidth - size) / 2;
        const sourceY = (img.naturalHeight - size) / 2;
        const sourceWidth = size;
        const sourceHeight = size;

        // Clear the canvas with a transparent background
        ctx.clearRect(0, 0, outputSize, outputSize);
        
        // Draw the cropped image (square crop from center)
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, outputSize, outputSize
        );
        
        // Optional: Apply subtle sharpening filter for better quality
        const imageData = ctx.getImageData(0, 0, outputSize, outputSize);
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], `avatar-${Date.now()}.png`, {
              type: 'image/png'
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to create cropped image'));
          }
        }, 'image/png', 0.9);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = previewUrl;
    });
  }, [previewUrl, cropData]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Crop the image first
      const croppedFile = await handleCropImage();
      
      // Upload the cropped image
      const response = await authService.uploadAvatar(croppedFile);
      
      if (response.success && response.avatarUrl) {
        onAvatarUpdate(response.avatarUrl);
        await refreshUser();
        
        toast({
          title: "Avatar Updated! 📸",
          description: "Your profile picture has been updated successfully.",
        });
        
        setIsPreviewOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        toast({
          title: "Upload Failed",
          description: response.message || "Failed to upload avatar",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      const response = await authService.deleteAvatar();
      
      if (response.success) {
        onAvatarUpdate('');
        await refreshUser();
        
        toast({
          title: "Avatar Removed",
          description: "Your profile picture has been removed.",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: response.message || "Failed to delete avatar",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Delete Error",
        description: error instanceof Error ? error.message : "Failed to delete avatar",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setCropData({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      scale: 1,
    });
  };

  return (
    <>
      <div className="relative group">
        <Avatar className="h-24 w-24 shadow-lg">
          {getAvatarUrl(currentAvatarUrl) ? (
            <AvatarImage 
              src={getAvatarUrl(currentAvatarUrl)} 
              alt="Profile" 
              className="avatar-image-perfect"
            />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg group-hover:scale-110 transition-transform"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>

        {/* Delete Button (show only if avatar exists) */}
        {currentAvatarUrl && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteAvatar}
            disabled={isUploading}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview and Crop Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-md bg-background border border-border shadow-elegant">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Crop Profile Picture</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative mx-auto w-64 h-64 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${cropData.scale})`,
                    transformOrigin: 'center',
                  }}
                />
              )}
              
              {/* Crop Overlay */}
              <div className="absolute inset-0 border-2 border-primary rounded-full opacity-50 pointer-events-none" 
                   style={{
                     left: '20%',
                     top: '20%',
                     width: '60%',
                     height: '60%',
                   }} 
              />
            </div>

            {/* Simple Instructions */}
            <div className="text-center text-sm text-muted-foreground">
              <p>The image will be cropped to a square and resized for your profile</p>
            </div>

            {/* Crop Controls */}
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCropData(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
              >
                Zoom Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCropData(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.1) }))}
              >
                Zoom In
              </Button>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleClosePreview}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="bg-primary text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Canvas for Image Processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </>
  );
};