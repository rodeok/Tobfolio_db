import { Response } from 'express';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getDashboardData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch user data along with other data in parallel
        const [user, properties, tenants, maintenance] = await Promise.all([
            User.findById(userId).select('name'),
            Property.find({ landlordId: userId }),
            Tenant.find({ landlordId: userId }),
            Maintenance.find({ landlordId: userId }),
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
        const isTenantActiveInMonth = (tenant: any, month: number, year: number) => {
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

        // Helper to calculate total rent so far for a tenant
        const calculateTotalRentSoFar = (tenant: any) => {
            const start = new Date(tenant.rentStart);
            const end = new Date(tenant.rentEnd);
            const today = new Date();
            
            const effectiveEnd = today < end ? today : end;
            if (effectiveEnd < start) return 0;
            
            const months = (effectiveEnd.getFullYear() - start.getFullYear()) * 12 + (effectiveEnd.getMonth() - start.getMonth()) + 1;
            return Math.max(0, months) * (tenant.rentAmount || 0);
        };

        const totalLifetimeIncome = tenants.reduce((sum, t) => sum + calculateTotalRentSoFar(t), 0);

        // Calculate Maintenance Costs (Repairs + Property Renovations)
        const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0) + 
                                     properties.reduce((sum, p) => sum + (p.totalRenovationCost || 0), 0);

        // Calculate Net Income (Profit - Cumulative)
        const netBalance = totalLifetimeIncome - totalMaintenanceCost;

        const incomeGrowth = lastMonthRent === 0
            ? (currentMonthRent > 0 ? 100 : 0)
            : ((currentMonthRent - lastMonthRent) / lastMonthRent) * 100;

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
            totalIncome: totalLifetimeIncome,
            incomeGrowth: Math.round(incomeGrowth),
            totalRentals,
            netBalance,
            maintenance: totalMaintenanceCost,
            chartData,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
