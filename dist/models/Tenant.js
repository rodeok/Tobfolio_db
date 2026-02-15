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
const tenantSchema = new mongoose_1.Schema({
    landlordId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    rentAmount: {
        type: Number,
        required: true,
    },
    rentStart: {
        type: Date,
        required: true,
    },
    rentEnd: {
        type: Date,
        required: true,
    },
    rentDuration: {
        type: String,
        required: true,
    },
    paymentFrequency: {
        type: String,
        required: true,
    },
    unitNumber: {
        type: String,
        required: true,
    },
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    isActive: {
        type: Boolean,
        default: true,
    },
    documents: [String],
    image: String,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// Calculate next payment date before saving
tenantSchema.pre('save', function (next) {
    if (this.lastPaymentDate) {
        const nextPayment = new Date(this.lastPaymentDate);
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        this.nextPaymentDate = nextPayment;
    }
    next();
});
const Tenant = mongoose_1.default.model('Tenant', tenantSchema);
exports.default = Tenant;
