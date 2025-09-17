import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow single file upload
  },
});

// Middleware to process and save avatar images
export const processAvatarImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const userId = req.user?.id; // Assuming user is attached to request by auth middleware
    const filename = `avatar-${userId}-${timestamp}.jpg`;
    const filepath = path.join(avatarsDir, filename);

    // Process image with Sharp: resize, optimize, and save as WebP
    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      // Apply a subtle circular crop for better avatar appearance
      .jpeg({ 
        quality: 90,
        progressive: true
      })
      .toFormat('jpeg')
      .toFile(filepath);

    // Create the URL path that will be accessible via the static middleware
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Attach processed file info to request for the next middleware
    req.processedFile = {
      filename,
      filepath,
      avatarUrl,
      originalname: req.file.originalname,
      mimetype: 'image/jpeg',
      size: fs.statSync(filepath).size
    };

    next();
  } catch (error) {
    console.error('Avatar processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process avatar image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Middleware to clean up old avatar files
export const cleanupOldAvatar = (oldAvatarUrl?: string) => {
  if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/avatars/')) {
    const filename = path.basename(oldAvatarUrl);
    const filepath = path.join(avatarsDir, filename);
    
    // Delete old avatar file asynchronously
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error('Failed to delete old avatar:', err);
      } else {
        console.log('Old avatar deleted:', filepath);
      }
    });
  }
};

// Extended Express Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      processedFile?: {
        filename: string;
        filepath: string;
        avatarUrl: string;
        originalname: string;
        mimetype: string;
        size: number;
      };
    }
  }
}