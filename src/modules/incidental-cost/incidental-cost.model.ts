import mongoose, { Schema, Document } from "mongoose";

export interface IIncidentalCosts extends Document {
  roomId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  description: string;
  whoPaid: "Landlord" | "Tenant";
  amount: number;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const incidentalCostsSchema: Schema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  whoPaid: {
    type: String,
    enum: ["Landlord", "Tenant"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const IncidentalCostsModel = mongoose.model<IIncidentalCosts>("IncidentalCosts", incidentalCostsSchema, "incidentalCosts");
export default IncidentalCostsModel;
