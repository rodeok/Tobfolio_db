"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const isProd = process.env.NODE_ENV === 'production';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tobfolio API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Tobfolio-ms backend',
        },
        servers: [
            {
                url: isProd ? 'https://tobfolio-db-1.onrender.com' : 'http://localhost:5000',
                description: isProd ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'Super Admin' },
                        email: { type: 'string', example: 'admin@tobfolio.com' },
                        phone: { type: 'string' },
                        about: { type: 'string' },
                        isActive: { type: 'boolean', default: true },
                        isBanned: { type: 'boolean', default: false },
                        referralCode: { type: 'string' },
                        referralPoints: { type: 'integer', default: 0 },
                        currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'GHS', 'RWF'], default: 'USD' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Property: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'Lekki Gardens' },
                        type: { type: 'string', example: 'Apartment' },
                        address: { type: 'string', example: '123 Lekki Phase 1' },
                        units: { type: 'integer' },
                        landlordId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Reward: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'Tobfolio T-Shirt' },
                        description: { type: 'string' },
                        imageUrl: { type: 'string' },
                        pointsRequired: { type: 'integer' },
                        isActive: { type: 'boolean' },
                    },
                },
                Redemption: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { $ref: '#/components/schemas/User' },
                        rewardId: { $ref: '#/components/schemas/Reward' },
                        status: { type: 'string', enum: ['pending', 'fulfilled', 'cancelled'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Handyman: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        fullName: { type: 'string', example: 'Emeka the Plumber' },
                        expertise: { type: 'string', example: 'Plumbing' },
                        location: { type: 'string', example: 'Lagos' },
                        description: { type: 'string' },
                        time: { type: 'string', enum: ['12hrs', '24hrs'] },
                        phoneNumber: { type: 'string' },
                        whatsappNumber: { type: 'string' },
                        email: { type: 'string' },
                        rating: { type: 'number', example: 4.5 },
                        reviewsCount: { type: 'integer' },
                        image: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        handymanId: { type: 'string' },
                        userId: { $ref: '#/components/schemas/User' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Maintenance: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        landlordId: { type: 'string' },
                        propertyId: { type: 'string' },
                        type: { type: 'string', example: 'Plumbing' },
                        cost: { type: 'number', example: 150 },
                        description: { type: 'string' },
                        status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
                        date: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Use absolute paths to ensure files are found regardless of CWD
    apis: [
        path_1.default.join(process.cwd(), 'src/routes/*.ts'),
        path_1.default.join(process.cwd(), 'dist/routes/*.js'),
        path_1.default.join(process.cwd(), 'backend/src/routes/*.ts'),
        path_1.default.join(process.cwd(), 'backend/dist/routes/*.js'),
    ],
};
console.log('Swagger Paths being scanned:', options.apis);
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
if (exports.swaggerSpec) {
    console.log('Swagger Spec generated successfully');
    // console.log('Spec titles:', Object.keys(swaggerSpec.paths || {}));
}
else {
    console.warn('Swagger Spec generation returned empty or null');
}
