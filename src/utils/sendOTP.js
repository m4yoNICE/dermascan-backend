import * as brevo from "@getbrevo/brevo";
import { ENV } from "../config/env.js";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = ENV.BREVO_API_KEY;

/**
 * Sends OTP email to user
 *
 * @async
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise<boolean>} True if sent successfully
 */
export const sendEmail = async (email, otp) => {
  try {
    console.log("Email and OTP: ", email, otp);
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: "DermaScan+",
      email: ENV.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = `Your OTP is ${otp}`;
    sendSmtpEmail.htmlContent = `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully.");
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};
