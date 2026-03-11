const nodemailer = require("nodemailer");
require("dotenv").config();

// Create the transporter object wrapping the Gmail App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "collegeivr5@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your_gmail_app_password", // The user must fill this in .env
  },
});

module.exports = transporter;
