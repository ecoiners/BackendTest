import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
	VERIFICATION_EMAIL_TEMPLATE,
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE
} from "./email.templates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }];
	
	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify Your Email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification"
		});
		
		console.log("Send email successfully: ", response);
		
	} catch (error) {
		console.log(" email verify code sending error ", error);
		throw new Error("Error send email: ", error);
	}
};


export const sendWelcomeEmail = async (email, username) => {
	const recipient = [{ email }];
	
	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "eieidj",
			template_variables: {
				"company_info_name": "Ali",
				"name": username
			}
		});
		
		console.log("email sending welcome successfully", response);
		
	} catch (error) {
		console.log("email sending welcome error: ", error);
	}
};


export const sendForgotPasswordEmail = async (email, resetURL) => {
	const recipient = [{ email }];
	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Reset Your Password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Reset Password"
		});
		
		console.log("Email sending reset password successfully.");
		
	} catch (error) {
		console.log("error sending forgot password: ", error);
	}
};

export const sendResetSuccessEmail = async (email) => {
	const recipient = [{ email }];
	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Password Reset Successfully",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Reset Password"
		});
		
		console.log("Send reset password successfully");
		
	} catch (error) {
		console.log("send reset email error; ", error)
	}
};