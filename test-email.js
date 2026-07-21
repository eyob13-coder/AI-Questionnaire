// Test email sending without the full app
require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

console.log('=== Testing Nodemailer Configuration ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.error('❌ Missing email credentials. Please check your .env file');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
console.log('\n=== Testing SMTP Connection ===');
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP Connection failed:', error.message);
    console.error('Full error:', error);
    
    // Common Gmail errors:
    if (error.code === 'EAUTH') {
      console.log('\n🔍 Common fixes for Gmail:');
      console.log('1. Make sure 2FA is enabled on your Google account');
      console.log('2. Generate an App Password at: https://myaccount.google.com/apppasswords');
      console.log('3. Use the 16-character App Password (with spaces) in .env');
      console.log('4. Format: SMTP_PASSWORD=xxxx xxxx xxxx xxxx');
    }
  } else {
    console.log('✅ SMTP Server is ready to send emails');
    
    // Try sending a test email
    console.log('\n=== Sending Test Email ===');
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from Vaultix',
      text: 'If you can read this, Nodemailer is working!',
      html: '<h1>Test Email</h1><p>If you can read this, Nodemailer is working!</p>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.error('❌ Test email failed:', error.message);
      } else {
        console.log('✅ Test email sent!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      process.exit(error ? 1 : 0);
    });
  }
});