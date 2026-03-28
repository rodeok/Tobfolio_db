import mongoose, { Document, Schema } from 'mongoose';

export interface IRedemption extends Document {
    userId: mongoose.Types.ObjectId;
    rewardId: mongoose.Types.ObjectId;
    pointsSpent: number;
    status: 'pending' | 'fulfilled' | 'cancelled';
    createdAt: Date;
}

const redemptionSchema = new Schema<IRedemption>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rewardId: {
        type: Schema.Types.ObjectId,
        ref: 'Reward',
        required: true,
    },
    pointsSpent: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Redemption = mongoose.model<IRedemption>('Redemption', redemptionSchema);

export default Redemption;
