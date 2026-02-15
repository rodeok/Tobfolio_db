import mongoose, { Schema, Document } from 'mongoose';

export interface IExchangeRate extends Document {
    rates: Record<string, number>;
    lastUpdated: Date;
}

const ExchangeRateSchema = new Schema<IExchangeRate>({
    rates: {
        type: Map,
        of: Number,
        required: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IExchangeRate>('ExchangeRate', ExchangeRateSchema);
