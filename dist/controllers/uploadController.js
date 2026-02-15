"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_js_1.default.uploader.upload_stream({
                folder: 'tobfolio_uploads',
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        res.json({
            success: true,
            url: result.secure_url,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: "Upload failed" });
    }
};
exports.uploadFile = uploadFile;
