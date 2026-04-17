import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  status: "active" | "inactive" | "suspended";
  createdAt?: Date;
  updatedAt?: Date;
}

const walletSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  }
}, {
  timestamps: true
});

const WalletModel = mongoose.model<IWallet>("Wallet", walletSchema);
export default WalletModel;
