import nodemailer from "nodemailer";
import envConfig from "../config/envConfig";
export type emailOptions = {
  email: string;
  subject: string;
  html: string;
};
export const sendEmail = (option: emailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 25,
    auth: {
      user: envConfig.mailAccount,
      pass: envConfig.mailAppPassword,
    },
  });
  const mailOptions = {
    from: envConfig.mailAccount,
    to: option.email,
    subject: option.subject,
    html: option.html,
  };
  transporter.sendMail(mailOptions);
};



