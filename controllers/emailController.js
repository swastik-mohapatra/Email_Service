const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

let transporter = nodemailer.createTransport({
  service:"gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  loggger: true,
  debug: true,
  secureConnection: false,
  secure: false, 
  auth: {
    user: process.env.SMTP_MAIL, 
    pass: process.env.SMTP_PASSWORD, 
  },
  tls: {
    rejectUnauthorized:true
  },
});

const sendEmail = expressAsyncHandler(async (req, res) => {
  const { email, name, message } = req.body;

  var mailOptions = {
    from: `"${name}" <${process.env.SMTP_MAIL}>`, 
    to: process.env.SMTP_MAIL,
    replyTo: email, 
    subject: "Message from " + name,
    text: `Message from ${name} (${email}):\n\n${message}`,
  };
  

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
    });
  }
});

module.exports = { sendEmail };