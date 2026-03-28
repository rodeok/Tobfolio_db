import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
    name: string;
    description: string;
    imageUrl: string;
    pointsRequired: number;
    isActive: boolean;
    createdAt: Date;
}

const rewardSchema = new Schema<IReward>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    pointsRequired: {
        type: Number,
        required: true,
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Reward = mongoose.model<IReward>('Reward', rewardSchema);

export default Reward;
