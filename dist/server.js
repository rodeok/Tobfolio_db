"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
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
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
dotenv_1.default.config();
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
app.use(express_1.default.json());
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
// Basic Route
app.get('/', (req, res) => {
    res.send('Tobfolio API is running...');
});
// Start Server
const startServer = async () => {
    try {
        await (0, db_js_1.default)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};
startServer();
