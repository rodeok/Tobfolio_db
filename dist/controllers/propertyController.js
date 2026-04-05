"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.getProperty = exports.createProperty = exports.getProperties = void 0;
const Property_js_1 = __importDefault(require("../models/Property.js"));
const Maintenance_js_1 = __importDefault(require("../models/Maintenance.js"));
const validations_js_1 = require("../utils/validations.js");
const getProperties = async (req, res) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const properties = await Property_js_1.default.find({ landlordId: actingLandlordId });
        res.json(properties);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching properties' });
    }
};
exports.getProperties = getProperties;
const createProperty = async (req, res) => {
    try {
        if (req.user?.role !== 'LANDLORD' && !req.user?.adminPrivilege) {
            return res.status(403).json({ message: 'You do not have permission to add properties' });
        }
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const validatedData = validations_js_1.propertySchema.parse(req.body);
        const property = await Property_js_1.default.create({
            ...validatedData,
            landlordId: actingLandlordId,
        });
        res.status(201).json(property);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Error creating property' });
    }
};
exports.createProperty = createProperty;
const getProperty = async (req, res) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const property = await Property_js_1.default.findOne({ _id: req.params.id, landlordId: actingLandlordId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        const maintenanceRecords = await Maintenance_js_1.default.find({ propertyId: req.params.id });
        const totalMaintenanceCost = maintenanceRecords.reduce((acc, curr) => acc + (curr.cost || 0), 0);
        const propertyObj = property.toObject();
        propertyObj.totalRenovationCost = totalMaintenanceCost;
        res.json(propertyObj);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching property' });
    }
};
exports.getProperty = getProperty;
const deleteProperty = async (req, res) => {
    try {
        if (req.user?.role !== 'LANDLORD' && !req.user?.adminPrivilege) {
            return res.status(403).json({ message: 'You do not have permission to delete properties' });
        }
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const property = await Property_js_1.default.findOneAndDelete({ _id: req.params.id, landlordId: actingLandlordId });
        if (!property) {
            return res.status(404).json({ message: 'Property not found or unauthorized' });
        }
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting property' });
    }
};
exports.deleteProperty = deleteProperty;
