import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const propertySchema = z.object({
    title: z.string().min(3, 'Title is required (min 3 chars)'),
    address: z.string().min(5, 'Address is required (min 5 chars)'),
    type: z.string().min(1, 'Property type is required'),
    size: z.string().optional(),
    estimatedValue: z.number().nonnegative('Value must be positive').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    propertyImages: z.array(z.string().url()).optional(),
});

export const maintenanceSchema = z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    type: z.string().min(1, 'Maintenance type is required'),
    cost: z.number().nonnegative('Cost must be positive'),
    description: z.string().min(5, 'Description is required (min 5 chars)').max(500, 'Description too long'),
    status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
    date: z.string().or(z.date()).optional(),
});
