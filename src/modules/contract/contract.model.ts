import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  tenantId: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  content: string;
  signature_A?: string;
  signature_B?: string;
  contractURI: string;
  deposit: number;
  image1CCCD?: string;
  image2CCCD?: string;
  status: 'unpaid' | 'pending_signature' | 'approved' | 'rejected';
  reason?: string;
  paid: boolean;
  userSignedAt?: Date | null;
  approvedBy?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const contractSchema: Schema = new Schema({
  tenantId: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  roomId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Room"
  },
  content: {
    type: String,
    required: true
  },
  signature_A: {
    type: String,
    default: ''
  },
  signature_B: {
    type: String,
    default: ''
  },
  contractURI: {
    type: String,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  image1CCCD: {
    type: String,
    default: ''
  },
  image2CCCD: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['unpaid', 'pending_signature', 'approved', 'rejected'],
    default: 'unpaid'
  },
  reason: {
    type: String,
    default: ''
  },
  paid: {
    type: Boolean,
    default: false
  },
  userSignedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const ContractModel = mongoose.model<IContract>('Contract', contractSchema);

export default ContractModel;
