import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
    email: string;
    role: 'MANAGER' | 'CARETAKER';
    landlordId: mongoose.Types.ObjectId;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    adminPrivilege: boolean;
    expiresAt: Date;
    createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['MANAGER', 'CARETAKER'],
        required: true,
    },
    landlordId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
        default: 'PENDING',
    },
    adminPrivilege: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);

export default Invitation;
