// import { Resend } from "resend";
import {sendBrevoEmail} from "./bravomail"



// const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
//   await resend.emails.send({
//     from: "mail@auth-masterclass-tutorial.com",
//     to: email,
//     subject: "2FA Code",
//     html: `<p>Your 2FA code: ${token}</p>`
//   });

const subject = "Your Two factor token"
const html= `<p>Your 2FA code: ${token}</p>`
await sendBrevoEmail(email, subject, html, token)
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

//   await resend.emails.send({
//     from: "mail@auth-masterclass-tutorial.com",
//     to: email,
//     subject: "Reset your password",
//     html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
//   });
const subject ="Reset your password";
const html= `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
await sendBrevoEmail(email, subject, html, token)
};

export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

//   await resend.emails.send({
//     from: "mail@auth-masterclass-tutorial.com",
//     to: email,
//     subject: "Confirm your email",
//     html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
//   });

const subject ="Confirm your email";
const html=`<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`;
await sendBrevoEmail(email, subject, html, token)
};
