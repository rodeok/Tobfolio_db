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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to Database
(0, db_js_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/properties', propertyRoutes_js_1.default);
app.use('/api/tenants', tenantRoutes_js_1.default);
app.use('/api/maintenance', maintenanceRoutes_js_1.default);
app.use('/api/user', userRoutes_js_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.send('Tobfolio API is running...');
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
