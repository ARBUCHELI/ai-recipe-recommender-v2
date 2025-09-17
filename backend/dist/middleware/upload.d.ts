import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const upload: multer.Multer;
export declare const processAvatarImage: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cleanupOldAvatar: (oldAvatarUrl?: string) => void;
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
//# sourceMappingURL=upload.d.ts.map