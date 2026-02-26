"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const Property_js_1 = __importDefault(require("../models/Property.js"));
const Tenant_js_1 = __importDefault(require("../models/Tenant.js"));
const Maintenance_js_1 = __importDefault(require("../models/Maintenance.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Fetch user data along with other data in parallel
        const [user, properties, tenants, maintenance] = await Promise.all([
            User_js_1.default.findById(userId).select('name'),
            Property_js_1.default.find({ landlordId: userId }),
            Tenant_js_1.default.find({ landlordId: userId }),
            Maintenance_js_1.default.find({ landlordId: userId }),
        ]);
        // 1. Total Rentals
        const totalRentals = properties.length;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        // Helper to check if tenant was active in a given month/year
        const isTenantActiveInMonth = (tenant, month, year) => {
            const start = new Date(tenant.rentStart);
            const end = new Date(tenant.rentEnd);
            const targetDate = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return start <= monthEnd && end >= targetDate;
        };
        // Calculate Gross Rent
        const currentMonthRent = tenants
            .filter(t => isTenantActiveInMonth(t, currentMonth, currentYear))
            .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
        const lastMonthRent = tenants
            .filter(t => isTenantActiveInMonth(t, lastMonth, lastMonthYear))
            .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
        // Calculate Maintenance Costs
        const currentMonthMaintenance = maintenance
            .filter(m => {
            const mDate = new Date(m.date);
            return mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear;
        })
            .reduce((sum, m) => sum + (m.cost || 0), 0);
        const lastMonthMaintenance = maintenance
            .filter(m => {
            const mDate = new Date(m.date);
            return mDate.getMonth() === lastMonth && mDate.getFullYear() === lastMonthYear;
        })
            .reduce((sum, m) => sum + (m.cost || 0), 0);
        // Calculate Net Income
        const currentMonthNetIncome = currentMonthRent - currentMonthMaintenance;
        const lastMonthNetIncome = lastMonthRent - lastMonthMaintenance;
        const incomeGrowth = lastMonthRent === 0
            ? (currentMonthRent > 0 ? 100 : 0)
            : ((currentMonthRent - lastMonthRent) / lastMonthRent) * 100;
        const netBalance = currentMonthNetIncome;
        // Chart Data (Last 12 months property value)
        const chartData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // End of month
            const monthName = d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
            // Value of properties created before or on this date
            const value = properties
                .filter(p => new Date(p.createdAt) <= d)
                .reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
            chartData.push({
                name: monthName,
                value: value
            });
        }
        res.json({
            userName: user?.name || 'User',
            totalIncome: currentMonthRent,
            incomeGrowth: Math.round(incomeGrowth),
            totalRentals,
            netBalance,
            maintenance: currentMonthMaintenance,
            chartData,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        });
    }
    catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getDashboardData = getDashboardData;
