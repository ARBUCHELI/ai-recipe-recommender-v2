"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldAvatar = exports.processAvatarImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(avatarsDir)) {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
}
// Multer configuration for memory storage
const storage = multer_1.default.memoryStorage();
// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Create multer upload instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1, // Only allow single file upload
    },
});
// Middleware to process and save avatar images
const processAvatarImage = async (req, res, next) => {
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
        const filename = `avatar-${userId}-${timestamp}.webp`;
        const filepath = path_1.default.join(avatarsDir, filename);
        // Process image with Sharp: resize, optimize, and save as WebP
        await (0, sharp_1.default)(req.file.buffer)
            .resize(200, 200, {
            fit: 'cover',
            position: 'center'
        })
            .webp({
            quality: 85,
            effort: 4
        })
            .toFile(filepath);
        // Create the URL path that will be accessible via the static middleware
        const avatarUrl = `/uploads/avatars/${filename}`;
        // Attach processed file info to request for the next middleware
        req.processedFile = {
            filename,
            filepath,
            avatarUrl,
            originalname: req.file.originalname,
            mimetype: 'image/webp',
            size: fs_1.default.statSync(filepath).size
        };
        next();
    }
    catch (error) {
        console.error('Avatar processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process avatar image',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.processAvatarImage = processAvatarImage;
// Middleware to clean up old avatar files
const cleanupOldAvatar = (oldAvatarUrl) => {
    if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/avatars/')) {
        const filename = path_1.default.basename(oldAvatarUrl);
        const filepath = path_1.default.join(avatarsDir, filename);
        // Delete old avatar file asynchronously
        fs_1.default.unlink(filepath, (err) => {
            if (err) {
                console.error('Failed to delete old avatar:', err);
            }
            else {
                console.log('Old avatar deleted:', filepath);
            }
        });
    }
};
exports.cleanupOldAvatar = cleanupOldAvatar;
//# sourceMappingURL=upload.js.map