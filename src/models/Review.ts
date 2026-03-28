import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    handymanId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
    handymanId: { type: Schema.Types.ObjectId, ref: 'Handyman', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
