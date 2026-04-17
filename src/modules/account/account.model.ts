import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  email: string;
  password?: string;
  role: 'admin' | 'owner' | 'tenant';
  isActive: boolean;
  verificationCode?: string;
  verificationExpired?: Date;
  timeExpired: Date;
  _destroy: boolean;
  profile?: any; // Virtual field
}

const accountSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'tenant'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpired: {
    type: Date,
    default: null
  },
  timeExpired: {
    type: Date,
    required: true
  },
  _destroy: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for profiling
accountSchema.virtual('profile', {
  ref: (doc: any) => {
    if (doc.role === 'admin') return 'Admin';
    if (doc.role === 'owner') return 'Owner';
    if (doc.role === 'tenant') return 'Tenant';
    return null;
  },
  localField: '_id',
  foreignField: 'id_account',
  justOne: true
});

const AccountModel = mongoose.model<IAccount>('Account', accountSchema);

export default AccountModel;
