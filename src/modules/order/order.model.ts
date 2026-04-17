import mongoose, { Schema, Document } from "mongoose";

export interface IOrderHistory {
  tenantId: mongoose.Types.ObjectId;
  contract?: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
}

export interface IOrderRoom extends Document {
  roomId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
  contract?: mongoose.Types.ObjectId;
  startAt?: Date;
  endAt?: Date;
  oldElectricNumber: number;
  oldWaterNumber: number;
  history: IOrderHistory[];
  _destroy: boolean;
}

const orderSchema: Schema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  tenantId: [{
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: false
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  contract: {
    type: Schema.Types.ObjectId,
    ref: "Contract",
    required: false
  },
  startAt: {
    type: Date,
    required: false
  },
  endAt: {
    type: Date,
    required: false
  },
  oldElectricNumber: {
    type: Number,
    default: 0
  },
  oldWaterNumber: {
    type: Number,
    default: 0
  },
  history: [
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true
      },
      contract: {
        type: Schema.Types.ObjectId,
        ref: "Contract",
        required: false
      },
      startAt: {
        type: Date,
        required: true
      },
      endAt: {
        type: Date,
        required: true
      }
    }
  ],
  _destroy: {
    type: Boolean,
    default: false
  }
});

const OrderRoomModel = mongoose.model<IOrderRoom>('OrderRoom', orderSchema, "orderRooms");

export default OrderRoomModel;
