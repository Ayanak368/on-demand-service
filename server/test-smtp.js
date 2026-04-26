require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("SMTP Error Details:\n", error);
    } else {
        console.log("SMTP is ready to take our messages");
    }
    process.exit(0);
});
