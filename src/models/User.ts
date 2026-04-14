import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    about: string;
    password?: string;
    role: 'LANDLORD' | 'MANAGER' | 'CARETAKER';
    landlordId?: mongoose.Types.ObjectId; // Refers to the LANDLORD who invited them
    adminPrivilege: boolean;
    isActive: boolean;
    isBanned: boolean;
    referralCode: string;
    referredBy?: mongoose.Types.ObjectId;
    referralPoints: number;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    currency: 'USD' | 'EUR' | 'GBP' | 'NGN' | 'CAD' | 'GHS' | 'RWF';
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
    role: {
        type: String,
        enum: ['LANDLORD', 'MANAGER', 'CARETAKER'],
        default: 'LANDLORD',
    },
    landlordId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    adminPrivilege: {
        type: Boolean,
        default: false,
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
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'GHS', 'RWF'],
        default: 'USD',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
