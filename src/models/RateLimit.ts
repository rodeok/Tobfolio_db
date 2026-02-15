import mongoose, { Document, Schema } from 'mongoose';

export interface IRateLimit extends Document {
    key: string;
    count: number;
    resetAt: Date;
}

const rateLimitSchema = new Schema<IRateLimit>({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    resetAt: {
        type: Date,
        required: true,
    },
});

// TTL index to automatically delete expired documents
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit = mongoose.model<IRateLimit>('RateLimit', rateLimitSchema);

export default RateLimit;
