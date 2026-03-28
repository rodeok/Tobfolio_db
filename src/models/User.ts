import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    about: string;
    password?: string;
    isActive: boolean;
    isBanned: boolean;
    referralCode: string;
    referredBy?: mongoose.Types.ObjectId;
    referralPoints: number;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
    },
    about: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    referralPoints: {
        type: Number,
        default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
