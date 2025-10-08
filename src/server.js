import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// internal import
import { ENV } from "./config/env.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
const port = ENV.PORT;

app.use(cors({ origin: "*"}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

const starts = async () => {
	try {
		await connectDB();
		
		app.listen(port, () => console.log("✅ running server in port ", port));
	} catch (error) {
		console.log("❌ error running server: ", error);
		process.exit(1);
	}
};

starts();

export default app;