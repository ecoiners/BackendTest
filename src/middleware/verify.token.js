import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const verifyToken = (req, res, next) => {
	const token = req.cookies.token; // token or jwt bebas berdasarkan nama cookie nya
	
	if (!token) return res.status(401).json({
		success: false,
		messsage: "Unauthorized!!"
	});
	
	try {
		const decoded = jwt.verify(token, ENV.JWT_SECRET);
		if (!decoded) return res.status(401).json({
			success: false,
			message: "Unauthorized - Invalid token"
		});
		
		req.userId = decoded.userId;
		next();
	} catch (error) {
		console.log("decoded jwt error no valid: ", error);
		res.status(400).json({
			success: false,
			messsage: "error Invalid token, please try agains."
		});
	}
};