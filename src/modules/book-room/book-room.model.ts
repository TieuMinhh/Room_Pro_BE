import mongoose, { Schema, Document } from "mongoose";

export interface IBookRoom extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  status: "pending" | "reject" | "approve";
  startDate: string;
  endDate: string;
  note: string;
  reply: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookRoomSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  status: { type: String, enum: ["pending", "reject", "approve"], default: "pending" },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  note: { type: String, default: "" },
  reply: { type: String, default: "" }
},
  {
    timestamps: true
  }
);

const BookRoomModel = mongoose.model<IBookRoom>("BookRoom", bookRoomSchema);
export default BookRoomModel;
