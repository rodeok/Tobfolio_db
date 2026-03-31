import { Response } from 'express';
import Maintenance from '../models/Maintenance.js';
import { maintenanceSchema } from '../utils/validations.js';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        landlordId?: string;
        adminPrivilege: boolean;
    };
}

export const getMaintenanceRecords = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const maintenanceRecords = await Maintenance.find({ landlordId: actingLandlordId })
            .populate('propertyId', 'name')
            .sort({ date: -1 });
        res.json(maintenanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance records' });
    }
};

export const createMaintenanceRecord = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const validatedData = maintenanceSchema.parse(req.body);
        const maintenance = new Maintenance({
            ...validatedData,
            landlordId: actingLandlordId,
        });
        await maintenance.save();
        res.status(201).json(maintenance);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Maintenance creation error:', error);
        res.status(500).json({ message: 'Error creating maintenance record' });
    }
};

export const getMaintenanceRecord = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const maintenance = await Maintenance.findOne({ _id: req.params.id, landlordId: actingLandlordId })
            .populate('propertyId', 'name');

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance record' });
    }
};
