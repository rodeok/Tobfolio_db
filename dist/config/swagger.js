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
