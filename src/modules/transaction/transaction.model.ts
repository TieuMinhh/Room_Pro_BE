import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  receiverId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  amount: number;
  bank: string;
  orderInfo: mongoose.Types.ObjectId;
  cardType: string;
  description?: string;
  txnRef: string;
  status: 'pending' | 'success' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema: Schema = new Schema({
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  bank: {
    type: String,
    required: true,
  },
  orderInfo: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  cardType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  txnRef: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true
});

const TransactionModel = mongoose.model<ITransaction>("Transaction", transactionSchema);

export default TransactionModel;
