const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: process?.env?.SMTP_HOST,
  port: process?.env?.SMTP_PORT,
  auth: {
    user: process?.env?.SMTP_MAIL,
    pass: process?.env?.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
  pool: true, 
  maxConnections: 5, 
  maxMessages: 10, 
  connectionTimeout: 20000, 
  greetingTimeout: 10000, 
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Failed:", error);
  } else {
    console.log("SMTP Connection Established");
  }
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendEmail = expressAsyncHandler(async (req, res) => {
  const { email, name, message } = req?.body;

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format. Please provide a valid email address.",
    });
  }

  const mailOptions = {
    from: email,
    to: process.env.SMTP_MAIL,
    replyTo: email,
    subject: "Message from " + name,
    text: `You have received a message from ${name} (${email}):\n\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Message Received</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p>${message}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info?.response);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to send email",
    });
  }
});

module.exports = { sendEmail };
