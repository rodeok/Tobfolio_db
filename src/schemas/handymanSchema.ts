import { z } from 'zod';

export const handymanSchema = z.object({
    name: z.string().min(2),
    category: z.string(),
    location: z.string(),
    description: z.string(),
    phone: z.string(),
    whatsapp: z.string().optional(),
    email: z.string().email(),
    images: z.array(z.string()).optional(),
});

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(5),
});
