"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintenanceRecord = exports.createMaintenanceRecord = exports.getMaintenanceRecords = void 0;
const zod_1 = require("zod");
const Maintenance_js_1 = __importDefault(require("../models/Maintenance.js"));
const validations_js_1 = require("../utils/validations.js");
const getMaintenanceRecords = async (req, res) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const maintenanceRecords = await Maintenance_js_1.default.find({ landlordId: actingLandlordId })
            .populate('propertyId', 'name')
            .sort({ date: -1 });
        res.json(maintenanceRecords);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance records' });
    }
};
exports.getMaintenanceRecords = getMaintenanceRecords;
const createMaintenanceRecord = async (req, res) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const validatedData = validations_js_1.maintenanceSchema.parse(req.body);
        const maintenance = new Maintenance_js_1.default({
            ...validatedData,
            landlordId: actingLandlordId,
        });
        await maintenance.save();
        res.status(201).json(maintenance);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors.map((e) => e.message)
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: `Invalid value for field: ${error.path}`
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error('Maintenance creation error:', error);
        res.status(500).json({ message: 'Error creating maintenance record' });
    }
};
exports.createMaintenanceRecord = createMaintenanceRecord;
const getMaintenanceRecord = async (req, res) => {
    try {
        const actingLandlordId = req.user?.landlordId || req.user?.userId;
        const maintenance = await Maintenance_js_1.default.findOne({ _id: req.params.id, landlordId: actingLandlordId })
            .populate('propertyId', 'name');
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance record' });
    }
};
exports.getMaintenanceRecord = getMaintenanceRecord;
