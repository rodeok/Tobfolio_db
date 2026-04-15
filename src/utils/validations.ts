import { z } from 'zod';

// Helper for MongoDB ObjectId validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['LANDLORD', 'MANAGER', 'CARETAKER', 'TENANT', 'ADMIN', 'landlord', 'tenant', 'admin']).optional(),
    referralCode: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const propertySchema = z.object({
    name: z.string().min(3, 'Name is required (min 3 chars)'),
    address: z.string().min(5, 'Address is required (min 5 chars)'),
    type: z.string().min(1, 'Property type is required'),
    size: z.string().optional(),
    units: z.number().int().positive().optional(),
    estimatedValue: z.number().nonnegative('Value must be positive').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    propertyImages: z.array(z.string().url()).optional(),
});

export const maintenanceSchema = z.object({
    propertyId: objectIdSchema,
    type: z.string().min(1, 'Maintenance type is required'),
    cost: z.coerce.number().nonnegative('Cost must be positive'),
    description: z.string().min(5, 'Description is required (min 5 chars)').max(500, 'Description too long'),
    status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
    date: z.string().or(z.date()).optional(),
});

export const tenantSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    propertyId: objectIdSchema,
    unitNumber: z.string().min(1, 'Unit number is required'),
    rentAmount: z.coerce.number().positive('Rent amount must be positive'),
    rentStart: z.string().or(z.date()),
    rentEnd: z.string().or(z.date()),
    rentDuration: z.string().min(1, 'Rent duration is required'),
    paymentFrequency: z.enum(['monthly', 'yearly']),
    image: z.string().url().optional(),
    notes: z.string().optional(),
});
