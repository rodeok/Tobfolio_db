import { Response } from 'express';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Maintenance from '../models/Maintenance.js';
import { propertySchema } from '../utils/validations.js';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getProperties = async (req: AuthRequest, res: Response) => {
    try {
        const properties = await Property.find({ landlordId: req.user?.userId });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties' });
    }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = propertySchema.parse(req.body);
        const property = await Property.create({
            ...validatedData,
            landlordId: req.user?.userId,
        });
        res.status(201).json(property);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Error creating property' });
    }
};

export const getProperty = async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findOne({ _id: req.params.id, landlordId: req.user?.userId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const maintenanceRecords = await Maintenance.find({ propertyId: req.params.id });
        const totalMaintenanceCost = maintenanceRecords.reduce((acc: number, curr: any) => acc + (curr.cost || 0), 0);

        const propertyObj = property.toObject();
        (propertyObj as any).totalRenovationCost = totalMaintenanceCost;

        res.json(propertyObj);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property' });
    }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findOneAndDelete({ _id: req.params.id, landlordId: req.user?.userId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property' });
    }
};
