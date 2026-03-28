"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renewTenant = exports.deleteTenant = exports.updateTenant = exports.getTenant = exports.createTenant = exports.getTenants = void 0;
const Tenant_js_1 = __importDefault(require("../models/Tenant.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const getTenants = async (req, res) => {
    const authReq = req;
    try {
        const tenants = await Tenant_js_1.default.find({ landlordId: authReq.user?.userId })
            .populate('propertyId', 'title address type');
        res.json(tenants);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tenants' });
    }
};
exports.getTenants = getTenants;
const createTenant = async (req, res) => {
    const authReq = req;
    try {
        const tenant = new Tenant_js_1.default({
            ...req.body,
            landlordId: authReq.user?.userId,
        });
        await tenant.save();
        res.status(201).json(tenant);
    }
    catch (error) {
        console.error('Tenant creation error:', error);
        res.status(500).json({ message: 'Error creating tenant' });
    }
};
exports.createTenant = createTenant;
const getTenant = async (req, res) => {
    const authReq = req;
    try {
        const tenant = await Tenant_js_1.default.findOne({ _id: req.params.id, landlordId: authReq.user?.userId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch tenant' });
    }
};
exports.getTenant = getTenant;
const updateTenant = async (req, res) => {
    const authReq = req;
    try {
        const updatedTenant = await Tenant_js_1.default.findOneAndUpdate({ _id: req.params.id, landlordId: authReq.user?.userId }, req.body, { new: true });
        if (!updatedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }
        res.json(updatedTenant);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update tenant' });
    }
};
exports.updateTenant = updateTenant;
const deleteTenant = async (req, res) => {
    const authReq = req;
    try {
        const tenant = await Tenant_js_1.default.findOne({ _id: req.params.id, landlordId: authReq.user?.userId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }
        // Automatically delete user/tenants as requested
        const tenantEmail = tenant.email;
        // Delete the tenant record
        await Tenant_js_1.default.deleteOne({ _id: tenant._id });
        // Delete the associated user record if it exists
        if (tenantEmail) {
            await User_js_1.default.findOneAndDelete({ email: tenantEmail });
        }
        res.json({ message: 'Tenant and associated user deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting tenant:', error);
        res.status(500).json({ message: 'Failed to delete tenant and associated user' });
    }
};
exports.deleteTenant = deleteTenant;
const renewTenant = async (req, res) => {
    const authReq = req;
    try {
        const { paymentFrequency, rentStart, rentEnd, rentAmount } = req.body;
        const updatedTenant = await Tenant_js_1.default.findOneAndUpdate({ _id: req.params.id, landlordId: authReq.user?.userId }, {
            paymentFrequency,
            rentStart,
            rentEnd,
            rentAmount,
            nextPaymentDate: rentStart // Optionally reset next payment date to renewal date
        }, { new: true });
        if (!updatedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }
        res.json(updatedTenant);
    }
    catch (error) {
        console.error('Error renewing tenant:', error);
        res.status(500).json({ message: 'Failed to renew tenant' });
    }
};
exports.renewTenant = renewTenant;
