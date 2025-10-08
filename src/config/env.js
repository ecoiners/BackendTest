import dotenv from "dotenv";

dotenv.config();

export const ENV = {
	PORT: process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	NODE_ENV: process.env.NODE_ENV,
	MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
	MAILTRAP_ENDPOINT: process.env.MAILTRAP_ENDPOINT
};