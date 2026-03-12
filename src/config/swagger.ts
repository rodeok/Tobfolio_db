import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const options: swaggerJSDoc.Options = {
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
    path.join(process.cwd(), 'src/routes/*.ts'),
    path.join(process.cwd(), 'dist/routes/*.js'),
    path.join(process.cwd(), 'backend/src/routes/*.ts'),
    path.join(process.cwd(), 'backend/dist/routes/*.js'),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
