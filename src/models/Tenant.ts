import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
    landlordId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    rentAmount: number;
    rentStart: Date;
    rentEnd: Date;
    rentDuration: string;
    paymentFrequency: string;
    unitNumber: string;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    isActive: boolean;
    documents: string[];
    image?: string;
    notes?: string;
    createdAt: Date;
}

const tenantSchema = new Schema<ITenant>({
    landlordId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    propertyId: {
        type: Schema.Types.ObjectId,
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

const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);

export default Tenant;
