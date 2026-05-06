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
    managementType: z.enum(['single_unit', 'entire_building']).optional(),
    unitType: z.enum(['flat', 'room', 'villa', 'office']).optional(),
    unitNumber: z.string().optional(),
    totalUnits: z.number().int().positive().optional(),
    unitDescription: z.string().max(500, 'Unit description too long').optional(),
}).refine((data) => {
    // If managementType is provided, unitType must also be provided
    if (data.managementType && !data.unitType) {
        return false;
    }
    // If managementType is single_unit, unitNumber is required
    if (data.managementType === 'single_unit' && !data.unitNumber) {
        return false;
    }
    // If managementType is entire_building, totalUnits is required
    if (data.managementType === 'entire_building' && !data.totalUnits) {
        return false;
    }
    // If unitType is provided, managementType should also be provided
    if (data.unitType && !data.managementType) {
        return false;
    }
    return true;
}, {
    message: 'Invalid unit management configuration',
    path: ['managementType'],
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
