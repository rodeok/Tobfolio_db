import mongoose, { Document, Schema } from 'mongoose';

export interface IHandyman extends Document {
    fullName: string;
    expertise: string;
    location: string;
    rating: number;
    reviewsCount: number;
    description: string;
    time: '12hrs' | '24hrs';
    phoneNumber: string;
    whatsappNumber?: string;
    email: string;
    images: string[];
    createdAt: Date;
}

const handymanSchema = new Schema<IHandyman>({
    fullName: { type: String, required: true },
    expertise: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    description: { type: String, required: true },
    time: { type: String, enum: ['12hrs', '24hrs'], required: true },
    phoneNumber: { type: String, required: true },
    whatsappNumber: { type: String },
    email: { type: String, required: true },
    images: [String],
    createdAt: { type: Date, default: Date.now },
});

const Handyman = mongoose.model<IHandyman>('Handyman', handymanSchema);
export default Handyman;
