"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDashboardMetrics = void 0;
const Property_js_1 = __importDefault(require("../models/Property.js"));
const Tenant_js_1 = __importDefault(require("../models/Tenant.js"));
const Maintenance_js_1 = __importDefault(require("../models/Maintenance.js"));
const calculateDashboardMetrics = async (userId) => {
    const [properties, tenants, maintenance] = await Promise.all([
        Property_js_1.default.find({ landlordId: userId }),
        Tenant_js_1.default.find({ landlordId: userId }),
        Maintenance_js_1.default.find({ landlordId: userId }),
    ]);
    const totalRentals = properties.length;
    const now = new Date();
    // Helper to check if tenant was active in a given month/year
    const isTenantActiveInMonth = (tenant, month, year) => {
        const start = new Date(tenant.rentStart);
        const end = new Date(tenant.rentEnd);
        const targetDate = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        return start <= monthEnd && end >= targetDate;
    };
    // Helper to calculate total rent so far for a tenant
    const calculateTotalRentSoFar = (tenant) => {
        const start = new Date(tenant.rentStart);
        const end = new Date(tenant.rentEnd);
        const today = new Date();
        const effectiveEnd = today < end ? today : end;
        if (effectiveEnd < start)
            return 0;
        const months = (effectiveEnd.getFullYear() - start.getFullYear()) * 12 + (effectiveEnd.getMonth() - start.getMonth()) + 1;
        return Math.max(0, months) * (tenant.rentAmount || 0);
    };
    const totalLifetimeIncome = tenants.reduce((sum, t) => sum + calculateTotalRentSoFar(t), 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0) +
        properties.reduce((sum, p) => sum + (p.totalRenovationCost || 0), 0);
    const netBalance = totalLifetimeIncome - totalMaintenanceCost;
    // Expired Rent (Total rent for tenants whose rent has ended)
    const expiredRent = tenants
        .filter(t => new Date(t.rentEnd) < now)
        .reduce((sum, t) => sum + calculateTotalRentSoFar(t), 0);
    const totalUnits = properties.reduce((sum, p) => sum + (p.units || 1), 0);
    const occupiedUnits = tenants.filter(t => t.isActive).length;
    const vacantUnits = Math.max(0, totalUnits - occupiedUnits);
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    return {
        totalIncome: totalLifetimeIncome,
        netBalance,
        maintenance: totalMaintenanceCost,
        totalRentals,
        expiredRent,
        propertiesCount: properties.length,
        tenantsCount: tenants.length,
        activeTenantsCount: occupiedUnits,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate: Math.round(occupancyRate),
    };
};
exports.calculateDashboardMetrics = calculateDashboardMetrics;
