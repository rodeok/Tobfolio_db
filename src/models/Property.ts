import mongoose, { Document, Schema } from 'mongoose';

export interface IRenovation {
    type: string;
    description?: string;
    cost: number;
    date: Date;
    documents: string[];
}

export interface IProperty extends Document {
    landlordId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    address: string;
    type: string;
    size?: string;
    units?: number;
    propertyImages: string[];
    renovations: IRenovation[];
    totalRenovationCost: number;
    purchasePrice?: number;
    estimatedValue?: number;
    createdAt: Date;
}

const renovationSchema = new Schema<IRenovation>({
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

const propertySchema = new Schema<IProperty>({
    landlordId: {
        type: Schema.Types.ObjectId,
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

const Property = mongoose.model<IProperty>('Property', propertySchema);

export default Property;
