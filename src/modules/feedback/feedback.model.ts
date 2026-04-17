import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  description: string;
  images: string[];
  status: "Pending" | "Replied";
  reply: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const feedbackSchema: Schema = new Schema({
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
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["Pending", "Replied"],
    default: "Pending",
  },
  reply: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema, "feedback");

export default FeedbackModel;
