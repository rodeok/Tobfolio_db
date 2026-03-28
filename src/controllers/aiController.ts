import { Request, Response } from 'express';
import groq from '../config/groq.js';
import { calculateDashboardMetrics } from '../utils/dashboardUtils.js';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const chat = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Fetch dashboard metrics for context
        const metrics = await calculateDashboardMetrics(userId);

        const context = `
            User Dashboard Data:
            - Total Income: $${metrics.totalIncome.toFixed(2)}
            - Net Balance (Profit): $${metrics.netBalance.toFixed(2)}
            - Total Maintenance Costs: $${metrics.maintenance.toFixed(2)}
            - Total Properties: ${metrics.propertiesCount}
            - Total Tenants: ${metrics.tenantsCount}
            - Active Tenants: ${metrics.activeTenantsCount}
            - Expired Rent (Value): $${metrics.expiredRent.toFixed(2)}
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant for a property management dashboard called Tobfolio. 
                    You have access to the following data about the user's account:
                    ${context}
                    
                    ONLY answer questions using the provided data. If a user asks something not related to their dashboard data or Tobfolio, politely inform them that you can only assist with their property management data.
                    Keep your answers concise and professional.`,
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            model: 'llama-3.3-70b-versatile',
        });

        res.json({
            reply: chatCompletion.choices[0]?.message?.content || '',
        });
    } catch (error) {
        console.error('Groq AI error:', error);
        res.status(500).json({ message: 'AI service error' });
    }
};
