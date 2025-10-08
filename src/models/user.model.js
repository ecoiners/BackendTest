import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		minLength: [5, "username minimum 5 characters😭"]
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user"
	},

	// ✅ Tambahan
	ipAddress: {
		type: String,
		default: null
	},
	deviceName: {
		type: String,
		default: null
	},

	// ✅ Referral system
	referralCode: {
		type: String,
		required: true,
		unique: true
	},
	referredBy: {
		type: String, // simpan referralCode orang yang mengundang
		default: null
	},
	referralHistory: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Users"
			},
			username: String,
			email: String,
			joinedAt: {
				type: Date,
				default: Date.now
			}
		}
	],
	totalReferrals: {
		type: Number,
		default: 0
	},

	lastLogin: {
		type: Date,
		default: Date.now
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	resetPasswordToken: String,
	resetPasswordExpiresAt: Date,
	verificationToken: String,
	verificationTokenExpiresAt: Date
}, { timestamps: true });

// Middleware untuk generate referral code otomatis saat register
userSchema.pre("save", function(next) {
	if (!this.referralCode) {
		this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
	}
	next();
});

const Users = mongoose.model("Users", userSchema);

export default Users;







/*


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		minLength: [5, "username minimum 5 character."]
	},
	lastLogin: {
		type: Date,
		default: Date.now
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	resetPasswordToken: String,
	resetPasswordExpiresAt: Date,
	verificationToken: String,
	verificationTokenExpiresAt: Date
}, {timestamps: true});

const Users = mongoose.model("Users", userSchema);

export default Users;


saya sedang bikin app mining airdrop aurion, tambahin juga dong ip dan device dan reffcode, siapa yang undang max 1 kali saat pendaftaran wajib masukan kode reff, jumlah reff code untuk history dalam array,  hasrate default 0.01 
dan setiap user yang berhasil invite dapat bonus hasrate juga 0.1 tanpa limit tapi hasrate bonus reff aktive ketika user juga ikut mining, start mining baru aktive bonus hasrate nya gimana??


 */