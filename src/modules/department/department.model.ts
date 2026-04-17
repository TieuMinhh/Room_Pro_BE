import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  electricPrice: number;
  waterPrice: number;
  province: string;
  district: string;
  commune: string;
  village: string;
  _destroy: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const departmentSchema: Schema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    electricPrice: {
      type: Number,
      required: true,
    },
    waterPrice: {
      type: Number,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    commune: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    _destroy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DepartmentModel = mongoose.model<IDepartment>('Department', departmentSchema);

export default DepartmentModel;
