import mongoose from "mongoose";
import { env } from "./environment";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
      // Note: useNewUrlParser and useUnifiedTopology are deprecated in newer versions of Mongoose
    });
    console.log(`✅ MongoDB connected successfully to database: ${env.DATABASE_NAME}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
