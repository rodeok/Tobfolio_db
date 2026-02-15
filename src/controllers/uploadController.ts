import { Request, Response } from 'express';
import cloudinary from '@/config/cloudinary.js';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const uploadFile = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'tobfolio_uploads',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file!.buffer);
        });

        res.json({
            success: true,
            url: result.secure_url,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: "Upload failed" });
    }
};
