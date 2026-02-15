import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenance extends Document {
    landlordId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    type: string;
    cost: number;
    description: string;
    status: string;
    date: Date;
    createdAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>({
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
    type: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Completed',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);

export default Maintenance;
