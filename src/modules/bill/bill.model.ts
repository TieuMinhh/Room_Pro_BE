import mongoose, { Schema, Document } from "mongoose";

export interface IBillServiceFee {
  name: string;
  price: number;
}

export interface IBill extends Document {
  roomId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  price: number;
  oldElectricity?: number;
  newElectricity?: number;
  oldWater?: number;
  newWater?: number;
  time: Date;
  serviceFee: IBillServiceFee[];
  duration?: Date | null;
  prepay: number;
  total: number;
  isPaid: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const billSchema: Schema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldElectricity: {
    type: Number,
  },
  newElectricity: {
    type: Number,
  },
  oldWater: {
    type: Number,
  },
  newWater: {
    type: Number,
  },
  time: {
    type: Date,
    required: true
  },
  serviceFee: [
    {
      name: {
        type: String,
      },
      price: {
        type: Number,
      }
    }
  ],
  duration: {
    type: Date,
    default: null
  },
  prepay: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  },
},
  {
    timestamps: true,
  }
);

const BillModel = mongoose.model<IBill>("Bill", billSchema);
export default BillModel;
