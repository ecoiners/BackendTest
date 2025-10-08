
// versi 1 wajib reff
/*
import Users from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generate-token-and-setcookie.js";

export const register = async (req, res) => {
	try {
		const { email, password, username, referralCode, deviceName } = req.body;

		// 🔴 PERUBAHAN: Wajib ada referralCode
		if (!email || !password || !username || !referralCode) {
			throw new Error("Masukkan semua data dengan benar! Kode referral wajib diisi!");
		}

		// 🔍 Cek apakah user sudah ada
		const existingUser = await Users.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ success: false, message: "User sudah ada!" });
		}

		// 🔐 Hash password
		const hashedPassword = await bcryptjs.hash(password, 10);

		// 🌐 Dapatkan IP dari request
		const ipAddress =
			req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

		// 🔢 Generate token verifikasi
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		// 🎟️ Generate kode referral unik
		const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		// 🔴 PERUBAHAN: Selalu cari inviter karena referralCode wajib
		const inviter = await Users.findOne({ referralCode: referralCode.toUpperCase() });

		if (!inviter) {
			return res
				.status(400)
				.json({ success: false, message: "Code referral tidak valid!" });
		}

		// 🧾 Buat user baru
		const newUser = new Users({
			email,
			password: hashedPassword,
			username,
			ipAddress,
			deviceName: deviceName || "Unknown Device",
			referralCode: myReferralCode,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
			referredBy: inviter.referralCode, // 🔴 SELALU diisi
		});

		// 🔴 PERUBAHAN: Selalu update referral history inviter
		inviter.referralHistory.push({
			userId: newUser._id,
			username: newUser.username,
			email: newUser.email,
			joinedAt: Date.now(),
		});

		inviter.totalReferrals += 1;
		await inviter.save();
		await newUser.save();

		// 🍪 JWT Cookie
		generateTokenAndSetCookie(res, newUser._id);

		res.status(201).json({
			success: true,
			message: "Registrasi berhasil ✅",
			users: {
				...newUser._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};
*/

// versi 2 reff opsional
import Users from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generate-token-and-setcookie.js";
import { sendVerificationEmail, sendForgotPasswordEmail, sendResetSuccessEmail} from "../mailtrap/emails.js";

export const register = async (req, res) => {
	try {
		const { email, password, username, referralCode, deviceName } = req.body;

		if (!email || !password || !username) {
			throw new Error("Masukkan semua data dengan benar!");
		}

		// 🔍 Cek apakah user sudah ada
		const existingUser = await Users.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ success: false, message: "User sudah ada!" });
		}

		// 🔐 Hash password
		const hashedPassword = await bcryptjs.hash(password, 10);

		// 🌐 Dapatkan IP dari request
		const ipAddress =
			req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

		// 🔢 Generate token verifikasi
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		// 🎟️ Generate kode referral unik
		const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		let referredBy = null;

		// 🧾 Buat user baru dulu
		const newUser = new Users({
			email,
			password: hashedPassword,
			username,
			ipAddress,
			deviceName: deviceName || "Unknown Device",
			referralCode: myReferralCode,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
		});

		// 💬 Jika pakai kode referral
		if (referralCode) {
			const inviter = await Users.findOne({ referralCode: referralCode.toUpperCase() });

			if (!inviter) {
				return res
					.status(400)
					.json({ success: false, message: "Code referral tidak ditemukan!" });
			}

			newUser.referredBy = inviter.referralCode; // simpan siapa yang ngundang

			// Tambahkan user baru ke history inviter
			inviter.referralHistory.push({
				userId: newUser._id,
				username: newUser.username,
				email: newUser.email,
				joinedAt: Date.now(),
			});

			inviter.totalReferrals += 1;
			await inviter.save();
		}

		await newUser.save();

		// 🍪 JWT Cookie
		generateTokenAndSetCookie(res, newUser._id);
		
		await sendVerificationEmail(newUser.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "Registrasi berhasil ✅",
			users: {
				...newUser._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log(" error ", error);
		res.status(400).json({ success: false, message: "Server error registry!"});
	}
};


export const verifyEmail = async (req, res) => {
	const {code} = req.body;
	
	try {
		const users = await Users.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now()}
		});
		
		if (!users) return res.status(400).json({
			success: false,
			message: "Invalid or expired verification code"
		});
		
		users.isVerified = true;
		users.verificationToken = undefined;
		users.verificationTokenExpiresAt = undefined;
		await users.save();
		
		// optional: await sendWelcomeEmail(users.email, users.username);
		
		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			users: {
				...users._doc,
				password: undefined
			}
		});
		
	} catch (error) {
		console.log('error ', error);
		res.status(500).json({
			success: false,
			message: "Internal server error"
		});
	}
};

export const login = async (req, res) => {
	const {email, password} = req.body;
	
	try {
		const users = await Users.findOne({email});
		if (!users) return res.status(400).json({
			success: false,
			message: "Invalid credentials"
		});
		
		const isPasswordValid = await bcryptjs.compare(password, users.password);
		if (!isPasswordValid) return res.status(400).json({
			success: false,
			message: "Password is corret😭"
		});
		
		generateTokenAndSetCookie(res, users._id);
		
		users.lastLogin = new Date();
		await users.save();
		
		res.status(200).json({
			success: true,
			message: "Login successfully",
			users: {
				...users._doc,
				password: undefined
			}
		});
		
	} catch (error) {
		console.log("login error: ", error);
		res.status(500).json({
			success: false,
			message: "Error login, please try agins"
		});
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({
		success: true,
		message: "Logout successfully"
	});
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	
	try {
		const users = await Users.findOne({email});
		
		if (!users) return res.status(404).json({
			success: false,
			message: "User Not Found."
		});
		
		// generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // hari
		
		users.resetPasswordToken = resetToken;
		users.resetPasswordExpiresAt = resetTokenExpiresAt;
		await users.save();
		
		// send email verify
		await sendForgotPasswordEmail(users.email, `https://domain.com/reset-password/${resetToken}`);
		
		res.status(200).json({
			success: true,
			message: "Password reset link to your email."
		});
		
	} catch (error) {
		console.log("forgot password errro: ", error);
		res.status(500).json({
			success: false,
			message: "Server error forgot password."
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;
		
		const users = await Users.findOne({ 
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now()}
		});
		
		if (!users) return res.status(400).json({
			success: false,
			message: "Invalid or Expired token, please try agains."
		});
		
		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);
		
		users.password = hashedPassword;
		users.resetPasswordToken = undefined;
		users.resetPasswordExpiresAt = undefined;
		await users.save();
		
		// send email success 
		sendResetSuccessEmail(users.email);
		
		res.status(200).json({
			success: true,
			message: "Reset password successfully"
		});
		
	} catch (error) {
		console.log("reset password error: ", error);
		res.status(400).json({
			success: false,
			message: "Reset password error, Please try agins."
		});
	}
};

export const checkAuth = async (req, res) => {
	try {
		const users = await Users.findById(req.userId);
		
		if (!users) return res.status(404).json({
			success: false,
			message: "User Not Found"
		});
		
		res.status(200).json({
			success: true,
			users: {
				...users._doc,
				password: undefined
			}
		});
		
	} catch (error) {
		console.log("not auth error: ", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error"
		});
	}
};




/*
import Users from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import {generateTokenAndSetCookie} from "../utils/generate-token-and-setcookie.js";

export const register = async (req, res) => {
	const {email, password, username} = req.body;
	
	try {
		if (!email || !password || !username) {
			throw new Error("Masukan semua data dengan benar!");
		}
		
		const usersAlreadyExists = await Users.findOne({email});
		if (usersAlreadyExists) return res.status(400).json({success: false, message: "Users sudah ada!"});
		
		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const users = await Users({
			email,
			password: hashedPassword,
			username,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
		});
		
		await users.save();
		
		// jwt
		generateTokenAndSetCookie(res, users._id);
		res.status(201).json({
			success: true,
			message: "User register successfully✅",
			users: {
				...users._doc,
				password: undefined
			}
		});
		
	} catch (error) {
		res.status(400).json({success: false, message: error.message});
	}
	
};

*/