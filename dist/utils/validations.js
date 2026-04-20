"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantSchema = exports.maintenanceSchema = exports.propertySchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
// Helper for MongoDB ObjectId validation
const objectIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['LANDLORD', 'MANAGER', 'CARETAKER', 'TENANT', 'ADMIN', 'landlord', 'tenant', 'admin']).optional(),
    referralCode: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.propertySchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name is required (min 3 chars)'),
    address: zod_1.z.string().min(5, 'Address is required (min 5 chars)'),
    type: zod_1.z.string().min(1, 'Property type is required'),
    size: zod_1.z.string().optional(),
    units: zod_1.z.number().int().positive().optional(),
    estimatedValue: zod_1.z.number().nonnegative('Value must be positive').optional(),
    description: zod_1.z.string().max(1000, 'Description too long').optional(),
    propertyImages: zod_1.z.array(zod_1.z.string().url()).optional(),
});
exports.maintenanceSchema = zod_1.z.object({
    propertyId: objectIdSchema,
    type: zod_1.z.string().min(1, 'Maintenance type is required'),
    cost: zod_1.z.coerce.number().nonnegative('Cost must be positive'),
    description: zod_1.z.string().min(5, 'Description is required (min 5 chars)').max(500, 'Description too long'),
    status: zod_1.z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.tenantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(5, 'Phone number is required'),
    propertyId: objectIdSchema,
    unitNumber: zod_1.z.string().min(1, 'Unit number is required'),
    rentAmount: zod_1.z.coerce.number().positive('Rent amount must be positive'),
    rentStart: zod_1.z.string().or(zod_1.z.date()),
    rentEnd: zod_1.z.string().or(zod_1.z.date()),
    rentDuration: zod_1.z.string().min(1, 'Rent duration is required'),
    paymentFrequency: zod_1.z.enum(['monthly', 'yearly']),
    image: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().optional(),
});
