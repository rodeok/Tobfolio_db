"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSchema = exports.handymanSchema = void 0;
const zod_1 = require("zod");
exports.handymanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    category: zod_1.z.string(),
    location: zod_1.z.string(),
    description: zod_1.z.string(),
    phone: zod_1.z.string(),
    whatsapp: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.reviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(5),
});
