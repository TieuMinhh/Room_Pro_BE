import mongoose, { Schema, Document } from "mongoose";

export interface IServiceFee {
  name: string;
  price: number;
  unit: string;
}

export interface IRoom extends Document {
  roomId: string;
  image: string[];
  price: number;
  area?: number;
  utilities?: string;
  serviceFee: IServiceFee[];
  _destroy: boolean;
  departmentId: mongoose.Types.ObjectId;
  post: boolean;
  status: boolean;
  type: 'Phòng trọ' | 'Căn hộ mini';
  createdAt?: Date;
  updatedAt?: Date;
}

const serviceFeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false }
);

const roomSchema: Schema = new Schema(
  {
    roomId: { type: String, required: true },
    image: { type: [String], default: [] },
    price: { type: Number, required: true },
    area: { type: Number },
    utilities: { type: String },
    serviceFee: [serviceFeeSchema],
    _destroy: { type: Boolean, default: false },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    post: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ['Phòng trọ', 'Căn hộ mini'],
      default: 'Phòng trọ'
    },
  },
  {
    timestamps: true,
  }
);

const RoomModel = mongoose.model<IRoom>("Room", roomSchema);

export default RoomModel;
