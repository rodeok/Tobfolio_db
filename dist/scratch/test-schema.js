"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const objectIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const maintenanceSchema = zod_1.z.object({
    propertyId: objectIdSchema,
    type: zod_1.z.string().min(1, 'Maintenance type is required'),
    cost: zod_1.z.coerce.number().nonnegative('Cost must be positive'),
    description: zod_1.z.string().min(5, 'Description is required (min 5 chars)').max(500, 'Description too long'),
    status: zod_1.z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
const payload = {
    "propertyId": "string",
    "type": "string",
    "description": "string",
    "cost": 2220,
    "status": "Pending"
};
try {
    maintenanceSchema.parse(payload);
    console.log('Validation passed (Unexpected!)');
}
catch (error) {
    console.log('Validation failed as expected!');
    console.log('Error Name:', error.constructor.name);
    console.log('Error details:', JSON.stringify(error.errors, null, 2));
}
