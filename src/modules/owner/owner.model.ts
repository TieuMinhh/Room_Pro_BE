import mongoose, { Schema, Document } from "mongoose";

export interface IOwner extends Document {
  id_account: mongoose.Types.ObjectId;
  userName: string;
  displayName: string;
  phone: string;
  address?: string | null;
  dateOfBirth?: Date | null;
  CCCD?: string | null;
  avatar?: string | null;
  signature?: string | null;
  _destroy: boolean;
}

const ownerSchema: Schema = new Schema({
  id_account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  CCCD: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  _destroy: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const OwnerModel = mongoose.model<IOwner>('Owner', ownerSchema);

export default OwnerModel;
