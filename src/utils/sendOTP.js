import { BrevoClient } from "@getbrevo/brevo";
import { ENV } from "../config/env.js";

const brevo = new BrevoClient({ apiKey: ENV.BREVO_API_KEY });

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
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: "DermaScan+", email: ENV.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject: `Your OTP is ${otp}`,
      htmlContent: `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Email sent successfully.");
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};
