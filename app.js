const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const otpGenerator = require('otp-generator');

// Set up the Nodemailer transporter using SendGrid
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: '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', // replace with your SendGrid API key
    },
  })
);

const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

// Email content with OTP
const mailOptions = {
  from: 'mithunprakash1522@gmail.com', 
  to: 'mithunprakash1522@gmail.com',
  subject: 'OTP Verification',
  text: `Your OTP is: ${otp}`, 
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  }
});
