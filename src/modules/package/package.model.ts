import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  name: string;
  description: string[];
  price: number;
  availableTime: number;
  _destroy: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const packageSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: [String], default: [] },
  price: { type: Number, required: true },
  availableTime: { type: Number, required: true },
  _destroy: { type: Boolean, default: false }
}, { timestamps: true });

const PackageModel = mongoose.model<IPackage>('Package', packageSchema);
export default PackageModel;
