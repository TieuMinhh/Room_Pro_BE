import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  roomId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  availableFrom?: Date;
  deposit: number;
  description: string;
  _destroy: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const blogSchema: Schema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  availableFrom: {
    type: Date
  },
  deposit: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  _destroy: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const BlogModel = mongoose.model<IBlog>('Blog', blogSchema, 'blogs');
export default BlogModel;
