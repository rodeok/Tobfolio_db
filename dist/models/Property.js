"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const renovationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
    },
    description: String,
    cost: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    documents: [String],
});
const propertySchema = new mongoose_1.Schema({
    landlordId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    address: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: false,
    },
    units: {
        type: Number,
        default: 1,
    },
    propertyImages: [String],
    renovations: [renovationSchema],
    totalRenovationCost: {
        type: Number,
        default: 0,
    },
    purchasePrice: Number,
    estimatedValue: Number,
    managementType: {
        type: String,
        enum: ['single_unit', 'entire_building'],
    },
    unitType: {
        type: String,
        enum: ['flat', 'room', 'villa', 'office'],
    },
    unitNumber: String,
    totalUnits: Number,
    unitDescription: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// Calculate total renovation cost before saving
propertySchema.pre('save', function (next) {
    if (this.renovations && this.renovations.length > 0) {
        this.totalRenovationCost = this.renovations.reduce((total, renovation) => {
            return total + renovation.cost;
        }, 0);
    }
    next();
});
const Property = mongoose_1.default.model('Property', propertySchema);
exports.default = Property;
