import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';


dotenv.config();

// Suppress DEP0170 warning to prevent leaking MongoDB connection string in logs
const originalEmit = process.emit;
(process as any).emit = function (name: any, data: any, ...args: any[]) {
    if (
        name === 'warning' &&
        typeof data === 'object' &&
        data.name === 'DeprecationWarning' &&
        data.code === 'DEP0170'
    ) {
        return false;
    }
    return originalEmit.apply(process, [name, data, ...args] as any);
};

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
// connectDB();

// Middleware
app.set('trust proxy', 1); // Trust first proxy
app.use(cors());
app.use(express.json());

// Rate Limiting
// app.use(generalLimiter); // Removed global limiter to avoid double counting
// app.use('/api/v1/auth', authLimiter); // Moved below

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes); // Apply authLimiter only to auth routes
app.use('/api/v1/properties', generalLimiter, propertyRoutes);
app.use('/api/v1/tenants', generalLimiter, tenantRoutes);
app.use('/api/v1/maintenance', generalLimiter, maintenanceRoutes);
app.use('/api/v1/user', generalLimiter, userRoutes);
app.use('/api/v1/dashboard', generalLimiter, dashboardRoutes);
app.use('/api/v1/exchange-rates', generalLimiter, exchangeRateRoutes);
app.use('/api/v1/notifications', generalLimiter, notificationRoutes);
app.use('/api/v1/admin', generalLimiter, adminRoutes);
app.use('/api/v1/upload', generalLimiter, uploadRoutes);
app.use('/api/v1/cron', generalLimiter, cronRoutes);

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Basic Route
app.get('/', (req, res) => {
    res.send('Tobfolio API is running...');
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

startServer();
