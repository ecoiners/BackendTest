import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateTokenAndSetCookie = (res, userId) => {
	const token = jwt.sign({userId}, ENV.JWT_SECRET, {
		expiresIn: "7d"
	});
	
	// nama cookie bebas boleh token or jwt or lain
	res.cookie("token", token, {
		httpOnly: true,
		secure: ENV.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
	
	return token;
};

