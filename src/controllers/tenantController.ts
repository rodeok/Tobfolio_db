import express from 'express';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

interface AuthRequest extends express.Request {
    user?: {
        userId: string;
        role: string;
        landlordId?: string;
        adminPrivilege: boolean;
    };
}

export const getTenants = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const tenants = await Tenant.find({ landlordId: actingLandlordId })
            .populate('propertyId', 'name address type');
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants' });
    }
};

export const createTenant = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const tenant = new Tenant({
            ...req.body,
            landlordId: actingLandlordId,
        });
        await tenant.save();
        res.status(201).json(tenant);
    } catch (error) {
        console.error('Tenant creation error:', error);
        res.status(500).json({ message: 'Error creating tenant' });
    }
};

export const getTenant = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: actingLandlordId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tenant' });
    }
};

export const updateTenant = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const updatedTenant = await Tenant.findOneAndUpdate(
            { _id: req.params.id, landlordId: actingLandlordId },
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

export const deleteTenant = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: actingLandlordId });
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }

        // Automatically delete user/tenants as requested
        const tenantEmail = tenant.email;
        
        // Delete the tenant record
        await Tenant.deleteOne({ _id: tenant._id });

        // Delete the associated user record if it exists
        if (tenantEmail) {
            await User.findOneAndDelete({ email: tenantEmail });
        }

        res.json({ message: 'Tenant and associated user deleted successfully' });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        res.status(500).json({ message: 'Failed to delete tenant and associated user' });
    }
};

export const renewTenant = async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthRequest;
    try {
        const actingLandlordId = authReq.user?.landlordId || authReq.user?.userId;
        const { paymentFrequency, rentStart, rentEnd, rentAmount } = req.body;
        
        const updatedTenant = await Tenant.findOneAndUpdate(
            { _id: req.params.id, landlordId: actingLandlordId },
            { 
                paymentFrequency, 
                rentStart, 
                rentEnd, 
                rentAmount,
                nextPaymentDate: rentStart // Optionally reset next payment date to renewal date
            },
            { new: true }
        );

        if (!updatedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }

        res.json(updatedTenant);
    } catch (error) {
        console.error('Error renewing tenant:', error);
        res.status(500).json({ message: 'Failed to renew tenant' });
    }
};
