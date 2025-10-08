import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(ENV.MONGO_URI);
		console.log("✅ connected mongodb: ", conn.connection.host);
	} catch (error) {
		console.log("❌ connection mongodb error: ", error);
		process.exit(1);
	}
};