const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const sgTransport = require('nodemailer-sendgrid-transport');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://127.0.0.1:27017/otp-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
});

const Otp = mongoose.model('Otp', otpSchema);

app.use(bodyParser.json());
app.use(cors());

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: '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', // replace with your SendGrid API key
    },
  })
);

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

  const newOtp = new Otp({ email, otp });
  await newOtp.save();

  const imagePath = './hero.png';
  const imageBuffer = fs.readFileSync(imagePath);
  const encodedImage = imageBuffer.toString('base64');

  const htmlContent = `
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; line-height: 2; background-color: #f4f4f4; overflow-x: hidden;">
    <div style="margin: 50px auto; width: 90%; max-width: 100%; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); position: relative;">
      <div style="text-align: center; margin-bottom: 20px; ">
        <img src= cid:ykb alt="Your Brand Logo" style="max-width: 100%; border-radius: 8px;">
      </div>
      <div style="border-bottom: 2px solid #00466a; padding-bottom: 10px; text-align: center; background-color: #00466a; color: #fff; border-radius: 8px 8px 0 0; padding: 15px;">
      <div style="position: relative; margin: 20px 0; text-align: center;">
        <div style="position: relative; margin: 20px 0; text-align: center; display: flex; align-items: center;">
          <div style="flex: 1; height: 1px; background-color: #eee;"></div>
          <div style="margin: 0 10px;"></div>
          <div style="flex: 1; height: 1px; background-color: #eee;"></div>
        </div></div>
        <div>
          <p style="font-size: 1em; margin-bottom: 10px;">Thanks for signing up</p>
        </div>
        <h1 style="font-size: 1.5em; margin: 5px;">Verify your email address</h1>
      </div>
      <p style="font-size: 1.1em; text-align: center;">Hi there,</p>
      <p style="text-align: center;">Thank you for choosing Your Brand. Please use the following OTP to complete your Sign Up procedures. The OTP is valid for 5 minutes.</p>
      <div style="background: #00466a; margin: 20px auto; width: 80%; max-width: 300px; padding: 10px; color: #fff; border-radius: 4px; text-align: center;">
        <h2 style="margin: 0; font-size: 1.5em;">${otp}</h2>
      </div>
      <p style="font-size: 1em; text-align: center;">Regards,<br />Your Brand Team</p>
      <hr style="border-top: 1px solid #eee;">
      <div style="padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300; text-align: right;">
        <p>For Verification</p>
        <p>OTPs are Awesome</p>
        <p>One-Time Passwords</p>
      </div>
    </div>
  </body>
</html>
  `;

  const mailOptions = {
    from: 'mithunprakash1522@gmail.com',
    to: email,
    subject: 'OTP Verification',
    html: htmlContent,
    attachments: [
      {
        filename: 'hero.png',
        content: imageBuffer,
        encoding: 'base64',
        cid: 'ykb',
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Error sending email' });
    } else {
      console.log('Email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = await Otp.findOne({ email, otp });

  if (storedOtp) {
    res.status(200).json({ message: 'OTP verified successfully' });
    await storedOtp.deleteOne();
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
