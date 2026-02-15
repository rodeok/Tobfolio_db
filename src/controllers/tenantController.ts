import { Response } from 'express';
import Tenant from '@/models/Tenant.js';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getTenants = async (req: AuthRequest, res: Response) => {
    try {
        const tenants = await Tenant.find({ landlordId: req.user?.userId })
            .populate('propertyId', 'title address type');
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants' });
    }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
    try {
        const tenant = new Tenant({
            ...req.body,
            landlordId: req.user?.userId,
        });
        await tenant.save();
        res.status(201).json(tenant);
    } catch (error) {
        console.error('Tenant creation error:', error);
        res.status(500).json({ message: 'Error creating tenant' });
    }
};

export const getTenant = async (req: AuthRequest, res: Response) => {
    try {
        const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.user?.userId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tenant' });
    }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
    try {
        const updatedTenant = await Tenant.findOneAndUpdate(
            { _id: req.params.id, landlordId: req.user?.userId },
            req.body,
            { new: true }
        );

        if (!updatedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }

        res.json(updatedTenant);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update tenant' });
    }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
    try {
        const deletedTenant = await Tenant.findOneAndDelete({ _id: req.params.id, landlordId: req.user?.userId });

        if (!deletedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }

        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete tenant' });
    }
};
