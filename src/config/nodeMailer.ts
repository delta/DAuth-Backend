import nodeMailer from 'nodemailer';

const isProd = process.env.NODE_ENV === 'production';

const transporter = nodeMailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT as string),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify connection configuration
if (isProd)
  transporter.verify(function (error) {
    if (error) {
      //throw error;
      console.log(error);
    }
  });

export default transporter;
