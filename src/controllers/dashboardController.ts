import { Response } from 'express';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';
import { Request } from 'express';
import { calculateDashboardMetrics } from '../utils/dashboardUtils.js';

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

        // Fetch user data
        const user = await User.findById(userId).select('name');

        // Use the common utility for core metrics
        const metrics = await calculateDashboardMetrics(userId);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        // Fetch tenants and properties for growth calculation and chart
        const [tenants, properties] = await Promise.all([
            Tenant.find({ landlordId: userId }),
            Property.find({ landlordId: userId }),
        ]);

        // Helper to check if tenant was active in a given month/year
        const isTenantActiveInMonth = (tenant: any, month: number, year: number) => {
            const start = new Date(tenant.rentStart);
            const end = new Date(tenant.rentEnd);
            const targetDate = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return start <= monthEnd && end >= targetDate;
        };

        // Calculate Gross Rent for income growth
        const currentMonthRent = tenants
            .filter(t => isTenantActiveInMonth(t, currentMonth, currentYear))
            .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

        const lastMonthRent = tenants
            .filter(t => isTenantActiveInMonth(t, lastMonth, lastMonthYear))
            .reduce((sum, t) => sum + (t.rentAmount || 0), 0);

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
            totalIncome: metrics.totalIncome,
            incomeGrowth: Math.round(incomeGrowth),
            totalRentals: metrics.totalRentals,
            netBalance: metrics.netBalance,
            maintenance: metrics.maintenance,
            totalUnits: metrics.totalUnits,
            occupiedUnits: metrics.occupiedUnits,
            vacantUnits: metrics.vacantUnits,
            occupancyRate: metrics.occupancyRate,
            chartData,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
