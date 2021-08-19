import { Z_UNKNOWN } from 'zlib';
import transporter from '../config/nodeMailer';
const isProd = process.env.NODE_ENV === 'production';

export const getMailContent = (
  name: string,
  link: string,
  content: string,
  linkText: string
): string => {
  const html = `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title> title </title>
</head>

<body style="background-color: #e9ecef;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" bgcolor="#e9ecef">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 36px 24px;">
                            <a href="https://delta.nitt.edu/">
                                <img src="https://delta.nitt.edu/images/deltaLogoGreen.png"
                                    style="height:50px;width:50px">
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" bgcolor="#e9ecef">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="left" bgcolor="#ffffff"
                            style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                            <h3
                                style="margin: 0; font-size: 25px; font-weight: 700; letter-spacing: 0px; line-height: 48px;">
                                Hi,<span style="text-transform:capitalize;"> ${name} </span>
                            </h3>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" bgcolor="#e9ecef">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="left" bgcolor="#ffffff"
                            style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                            <p style="margin: 0;">
                                ${content}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" bgcolor="#ffffff">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                                    <a href=${link} target="_blank"
                                                        style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">${linkText}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" bgcolor="#e9ecef"
                            style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                            <p style="margin: 0;">You received this email because we received a request for registration
                                with your email account. If you didn't register you can safely delete this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`;

  return html;
};

export const sendNewAppMail = (
  email: string,
  name: string,
  appName: string
) => {
  const content = `A thrid-party Oauth application, ${appName} was recently authorized to access your account. Visit below link for more information`;
  const subject = `New Oauth App`;
  const linkText = 'dashboard';
  const link = `${process.env.FRONTEND_URL}/dashboard`;
  const mailContent = getMailContent(name, link, content, linkText);

  sendMail(email, subject, mailContent);
};

export const sendMail = (
  email: string,
  subject: string,
  mailContent: string
): Promise<unknown> => {
  const data = {
    from: 'Delta Force <no-reply@delta.nitt.edu>',
    to: email,
    subject: subject,
    html: mailContent
  };
  if (isProd) {
    return transporter.sendMail(data);
  }
  console.log(mailContent);
  return Promise.resolve(null);
};
