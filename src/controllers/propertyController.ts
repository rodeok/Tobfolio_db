import { Response } from 'express';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Maintenance from '../models/Maintenance.js';
import { propertySchema, propertyUpdateSchema } from '../utils/validations.js';
import { Request } from 'express';
import { calculateDashboardMetrics } from '../utils/dashboardUtils.js';
import { ZodError } from 'zod';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        landlordId?: string;
        adminPrivilege: boolean;
    };
}

export const getProperties = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const properties = await Property.find({ landlordId: actingLandlordId });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties' });
    }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'LANDLORD' && !req.user?.adminPrivilege) {
            return res.status(403).json({ message: 'You do not have permission to add properties' });
        }

        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const validatedData = propertySchema.parse(req.body);
        const property = await Property.create({
            ...validatedData,
            landlordId: actingLandlordId,
        });
        res.status(201).json(property);
    } catch (error: any) {
        if (error instanceof ZodError || error.name === 'ZodError') {
            return res.status(400).json({ 
                message: error.errors[0].message,
                errors: error.errors.map((e: any) => e.message)
            });
        }
        res.status(500).json({ message: 'Error creating property' });
    }
};

export const getProperty = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const property = await Property.findOne({ _id: req.params.id, landlordId: actingLandlordId });
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
        if (req.user?.role !== 'LANDLORD' && !req.user?.adminPrivilege) {
            return res.status(403).json({ message: 'You do not have permission to delete properties' });
        }

        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const property = await Property.findOneAndDelete({ _id: req.params.id, landlordId: actingLandlordId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property' });
    }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'LANDLORD' && !req.user?.adminPrivilege) {
            return res.status(403).json({ message: 'You do not have permission to update properties' });
        }

        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const validatedData = propertyUpdateSchema.parse(req.body);

        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, landlordId: actingLandlordId },
            { $set: validatedData },
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }

        res.json(property);
    } catch (error: any) {
        if (error instanceof ZodError || error.name === 'ZodError') {
            return res.status(400).json({ 
                message: error.errors[0].message,
                errors: error.errors.map((e: any) => e.message)
            });
        }
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Error updating property' });
    }
};

export const getRentalStats = async (req: AuthRequest, res: Response) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        if (!actingLandlordId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const metrics = await calculateDashboardMetrics(actingLandlordId);
        
        res.json({
            occupancyRate: metrics.occupancyRate,
            occupiedUnits: metrics.occupiedUnits,
            vacantUnits: metrics.vacantUnits,
            totalUnits: metrics.totalUnits
        });
    } catch (error) {
        console.error('Error fetching rental stats:', error);
        res.status(500).json({ message: 'Error fetching rental stats' });
    }
};
