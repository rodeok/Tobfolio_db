"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.updateTenant = exports.getTenant = exports.createTenant = exports.getTenants = void 0;
const Tenant_js_1 = __importDefault(require("../models/Tenant.js"));
const getTenants = async (req, res) => {
    try {
        const tenants = await Tenant_js_1.default.find({ landlordId: req.user?.userId })
            .populate('propertyId', 'title address type');
        res.json(tenants);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tenants' });
    }
};
exports.getTenants = getTenants;
const createTenant = async (req, res) => {
    try {
        const tenant = new Tenant_js_1.default({
            ...req.body,
            landlordId: req.user?.userId,
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
    try {
        const tenant = await Tenant_js_1.default.findOne({ _id: req.params.id, landlordId: req.user?.userId });
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
    try {
        const updatedTenant = await Tenant_js_1.default.findOneAndUpdate({ _id: req.params.id, landlordId: req.user?.userId }, req.body, { new: true });
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
    try {
        const deletedTenant = await Tenant_js_1.default.findOneAndDelete({ _id: req.params.id, landlordId: req.user?.userId });
        if (!deletedTenant) {
            return res.status(404).json({ message: 'Tenant not found or unauthorized' });
        }
        res.json({ message: 'Tenant deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete tenant' });
    }
};
exports.deleteTenant = deleteTenant;
