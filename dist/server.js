"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Triggering restart for Swagger update
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables immediately
dotenv_1.default.config();
const db_js_1 = __importDefault(require("./config/db.js"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const propertyRoutes_js_1 = __importDefault(require("./routes/propertyRoutes.js"));
const tenantRoutes_js_1 = __importDefault(require("./routes/tenantRoutes.js"));
const maintenanceRoutes_js_1 = __importDefault(require("./routes/maintenanceRoutes.js"));
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const dashboardRoutes_js_1 = __importDefault(require("./routes/dashboardRoutes.js"));
const exchangeRateRoutes_js_1 = __importDefault(require("./routes/exchangeRateRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const uploadRoutes_js_1 = __importDefault(require("./routes/uploadRoutes.js"));
const cronRoutes_js_1 = __importDefault(require("./routes/cronRoutes.js"));
const handymanRoutes_js_1 = __importDefault(require("./routes/handymanRoutes.js"));
const aiRoutes_js_1 = __importDefault(require("./routes/aiRoutes.js"));
const rewardRoutes_js_1 = __importDefault(require("./routes/rewardRoutes.js"));
const teamRoutes_js_1 = __importDefault(require("./routes/teamRoutes.js"));
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_js_1 = require("./config/swagger.js");
// Suppress DEP0170 warning to prevent leaking MongoDB connection string in logs
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
    if (name === 'warning' &&
        typeof data === 'object' &&
        data.name === 'DeprecationWarning' &&
        data.code === 'DEP0170') {
        return false;
    }
    return originalEmit.apply(process, [name, data, ...args]);
};
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to Database
// connectDB();
// Middleware
app.set('trust proxy', 1); // Trust first proxy
app.use((0, cors_1.default)());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
// Custom JSON error handler to catch SyntaxErrors from body-parser
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        console.error(`[${new Date().toISOString()}] JSON Parsing Error: ${err.message}`);
        console.error(`Request URL: ${req.url}`);
        if (req.rawBody) {
            console.error(`Raw Body: ${req.rawBody}`);
        }
        return res.status(400).json({
            success: false,
            message: 'Malformed JSON payload. Please ensure property names are double-quoted and there are no trailing commas.',
            error: err.message,
            rawBody: req.rawBody // Sending it back in dev for easier debugging
        });
    }
    next(err);
});
// Global logger for Render debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Diagnostic route
app.get('/swagger-health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasSwaggerSpec: !!swagger_js_1.swaggerSpec
    });
});
// Swagger UI Documentation
console.log('Registering Swagger UI at /api-docs');
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_js_1.swaggerSpec, {
    explorer: true,
    customSiteTitle: "Tobfolio API Docs"
}));
// Rate Limiting
// app.use(generalLimiter); // Removed global limiter to avoid double counting
// app.use('/api/v1/auth', authLimiter); // Moved below
// Routes
app.use('/api/v1/auth', rateLimiter_js_1.authLimiter, authRoutes_js_1.default); // Apply authLimiter only to auth routes
app.use('/api/v1/properties', rateLimiter_js_1.generalLimiter, propertyRoutes_js_1.default);
app.use('/api/v1/tenants', rateLimiter_js_1.generalLimiter, tenantRoutes_js_1.default);
app.use('/api/v1/maintenance', rateLimiter_js_1.generalLimiter, maintenanceRoutes_js_1.default);
app.use('/api/v1/user', rateLimiter_js_1.generalLimiter, userRoutes_js_1.default);
app.use('/api/v1/dashboard', rateLimiter_js_1.generalLimiter, dashboardRoutes_js_1.default);
app.use('/api/v1/exchange-rates', rateLimiter_js_1.generalLimiter, exchangeRateRoutes_js_1.default);
app.use('/api/v1/notifications', rateLimiter_js_1.generalLimiter, notificationRoutes_js_1.default);
app.use('/api/v1/admin', rateLimiter_js_1.generalLimiter, adminRoutes_js_1.default);
app.use('/api/v1/upload', rateLimiter_js_1.generalLimiter, uploadRoutes_js_1.default);
app.use('/api/v1/cron', rateLimiter_js_1.generalLimiter, cronRoutes_js_1.default);
app.use('/api/v1/handymen', rateLimiter_js_1.generalLimiter, handymanRoutes_js_1.default);
app.use('/api/v1/ai', rateLimiter_js_1.generalLimiter, aiRoutes_js_1.default);
app.use('/api/v1/rewards', rateLimiter_js_1.generalLimiter, rewardRoutes_js_1.default);
app.use('/api/v1/team', rateLimiter_js_1.generalLimiter, teamRoutes_js_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.send('Tobfolio API is running...');
});
// Catch-all 404 for debugging
app.use((req, res) => {
    console.log(`[${new Date().toISOString()}] 404 - Unmatched Request: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found on this server`,
        timestamp: new Date().toISOString()
    });
});
// Start Server
const startServer = async () => {
    // Start listening immediately so health checks pass on Render
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Try health check at: /swagger-health`);
    });
    try {
        console.log('Connecting to database...');
        await (0, db_js_1.default)();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        // Don't exit here, allows diagnostic routes to work even if DB is down
    }
};
startServer();
