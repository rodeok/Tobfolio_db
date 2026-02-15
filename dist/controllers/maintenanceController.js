"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintenanceRecord = exports.createMaintenanceRecord = exports.getMaintenanceRecords = void 0;
const Maintenance_js_1 = __importDefault(require("../models/Maintenance.js"));
const validations_js_1 = require("../utils/validations.js");
const getMaintenanceRecords = async (req, res) => {
    try {
        const maintenanceRecords = await Maintenance_js_1.default.find({ landlordId: req.user?.userId })
            .populate('propertyId', 'title')
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
        const validatedData = validations_js_1.maintenanceSchema.parse(req.body);
        const maintenance = new Maintenance_js_1.default({
            ...validatedData,
            landlordId: req.user?.userId,
        });
        await maintenance.save();
        res.status(201).json(maintenance);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Maintenance creation error:', error);
        res.status(500).json({ message: 'Error creating maintenance record' });
    }
};
exports.createMaintenanceRecord = createMaintenanceRecord;
const getMaintenanceRecord = async (req, res) => {
    try {
        const maintenance = await Maintenance_js_1.default.findOne({ _id: req.params.id, landlordId: req.user?.userId })
            .populate('propertyId', 'title');
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
