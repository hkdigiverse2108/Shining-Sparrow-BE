"use strict"

import nodemailer from 'nodemailer';
import { config } from '../../config';

let mail: any = config.MAIL

const option: any = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: mail,
        pass: config.GMAIL_PASSWORD
    }
};
const transPorter = nodemailer.createTransport(option)

export const email_verification_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mail,
                to: user.email,
                subject: "Login OTP - Shining Sparrow",
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Shining Sparrow - Login OTP</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            -webkit-font-smoothing: antialiased;
                        }
                        .container {
                            max-width: 580px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 16px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                            overflow: hidden;
                            border: 1px solid #e2e8f0;
                        }
                        .header {
                            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .logo {
                            height: 64px;
                            margin-bottom: 10px;
                            vertical-align: middle;
                        }
                        .hero {
                            padding: 35px 35px 20px 35px;
                            text-align: center;
                        }
                        .mascot {
                            height: 100px;
                            margin-bottom: 20px;
                        }
                        .title {
                            color: #0f172a;
                            font-size: 24px;
                            font-weight: 800;
                            margin: 0 0 10px 0;
                        }
                        .description {
                            color: #475569;
                            font-size: 15px;
                            line-height: 1.6;
                            margin: 0 0 25px 0;
                        }
                        .otp-container {
                            background: #fff7ed;
                            border: 2px dashed #ffedd5;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 25px 0;
                            display: inline-block;
                        }
                        .otp-code {
                            font-size: 32px;
                            font-weight: 800;
                            letter-spacing: 6px;
                            color: #ea580c;
                            font-family: "Courier New", Courier, monospace;
                        }
                        .badge {
                            display: inline-block;
                            background: #ffedd5;
                            color: #c2410c;
                            font-size: 11px;
                            font-weight: 700;
                            padding: 4px 10px;
                            border-radius: 20px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 8px;
                        }
                        .warning-text {
                            color: #64748b;
                            font-size: 12px;
                            line-height: 1.5;
                        }
                        .footer {
                            background: #f1f5f9;
                            padding: 30px 20px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-link {
                            color: #ea580c;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 14px;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 12px;
                            margin-top: 15px;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://shiningsparrow.com/logo.png" alt="Shining Sparrow Logo" class="logo" onerror="this.style.display='none'">
                            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Shining Sparrow</h2>
                        </div>
                        <div class="hero">
                            <img src="https://shiningsparrow.com/mascot.png" alt="Shining Sparrow Mascot" class="mascot" onerror="this.style.display='none'">
                            <div class="badge">Verification Required</div>
                            <h1 class="title">Secure Login OTP</h1>
                            <p class="description">
                                Hello Dear,<br>
                                We received a request to log in to your <strong>Shining Sparrow</strong> account. Use the verification code below to complete your access.
                            </p>
                            <div class="otp-container">
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p class="warning-text">
                                This OTP is valid for <strong>10 minutes</strong>. If you did not initiate this request, you can safely ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <a href="https://shiningsparrow.com" target="_blank" class="footer-link">www.shiningsparrow.com</a>
                            <p class="footer-text">
                                Warm Regards,<br>
                                <strong>Team Shining Sparrow</strong><br>
                                &copy; 2026 Shining Sparrow. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            };

            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(`Email has been sent to ${user.email}`);
                }
            });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

export const send_otr_mail = async (user: any, otr: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mail,
                to: user.email,
                subject: "Welcome to Shining Sparrow - Your OTR Code",
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Shining Sparrow</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            -webkit-font-smoothing: antialiased;
                        }
                        .container {
                            max-width: 580px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 16px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                            overflow: hidden;
                            border: 1px solid #e2e8f0;
                        }
                        .header {
                            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .logo {
                            height: 64px;
                            margin-bottom: 10px;
                            vertical-align: middle;
                        }
                        .hero {
                            padding: 35px 35px 20px 35px;
                            text-align: center;
                        }
                        .mascot {
                            height: 100px;
                            margin-bottom: 20px;
                        }
                        .title {
                            color: #0f172a;
                            font-size: 24px;
                            font-weight: 800;
                            margin: 0 0 10px 0;
                        }
                        .description {
                            color: #475569;
                            font-size: 15px;
                            line-height: 1.6;
                            margin: 0 0 25px 0;
                            text-align: left;
                        }
                        .credential-card {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 25px 0;
                            text-align: left;
                        }
                        .credential-row {
                            margin-bottom: 12px;
                            font-size: 14px;
                            color: #475569;
                        }
                        .credential-row:last-child {
                            margin-bottom: 0;
                        }
                        .label {
                            font-weight: 600;
                            color: #0f172a;
                            display: inline-block;
                            width: 120px;
                        }
                        .value {
                            font-weight: 500;
                            color: #334155;
                        }
                        .otr-badge {
                            background: #ea580c;
                            color: #ffffff;
                            font-size: 18px;
                            font-weight: 700;
                            padding: 6px 14px;
                            border-radius: 6px;
                            font-family: monospace;
                            display: inline-block;
                        }
                        .btn-primary {
                            display: inline-block;
                            background: #ea580c;
                            color: #ffffff !important;
                            font-weight: 700;
                            font-size: 15px;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 8px;
                            margin: 15px 0;
                            box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);
                        }
                        .warning-text {
                            color: #64748b;
                            font-size: 12px;
                            line-height: 1.5;
                            margin-top: 20px;
                        }
                        .footer {
                            background: #f1f5f9;
                            padding: 30px 20px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-link {
                            color: #ea580c;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 14px;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 12px;
                            margin-top: 15px;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://shiningsparrow.com/logo.png" alt="Shining Sparrow Logo" class="logo" onerror="this.style.display='none'">
                            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Shining Sparrow</h2>
                        </div>
                        <div class="hero">
                            <img src="https://shiningsparrow.com/mascot.png" alt="Shining Sparrow Mascot" class="mascot" onerror="this.style.display='none'">
                            <h1 class="title">Welcome to the flock!</h1>
                            <p class="description">
                                Hi ${user.fullName || 'Learner'},<br><br>
                                Thank you for registering at <strong>Shining Sparrow</strong>. Your registration has been successfully completed. Here are the credentials to access your student classroom:
                            </p>
                            
                            <div class="credential-card">
                                <div class="credential-row">
                                    <span class="label">Phone Number:</span>
                                    <span class="value">${user.phoneNumber}</span>
                                </div>
                                <div class="credential-row" style="margin-top: 15px; margin-bottom: 5px;">
                                    <span class="label" style="vertical-align: middle;">OTR Code:</span>
                                    <span class="otr-badge">${otr}</span>
                                </div>
                            </div>
                            
                            <a href="http://localhost:3000/login" target="_blank" class="btn-primary">Enter Classroom</a>
                            
                            <p class="warning-text">
                                * Please keep this OTR (One Time Registration) code safe. You will need it every time you log in to the classroom dashboard.
                            </p>
                        </div>
                        <div class="footer">
                            <a href="https://shiningsparrow.com" target="_blank" class="footer-link">www.shiningsparrow.com</a>
                            <p class="footer-text">
                                Warm Regards,<br>
                                <strong>Team Shining Sparrow</strong><br>
                                &copy; 2026 Shining Sparrow. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            };

            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(`Email has been sent to ${user.email}`);
                }
            });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

export const send_forgot_otr_mail = async (user: any, otr: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mail,
                to: user.email,
                subject: "Retrieve Your OTR Code - Shining Sparrow",
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Retrieve OTR Code - Shining Sparrow</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            -webkit-font-smoothing: antialiased;
                        }
                        .container {
                            max-width: 580px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 16px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                            overflow: hidden;
                            border: 1px solid #e2e8f0;
                        }
                        .header {
                            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .logo {
                            height: 64px;
                            margin-bottom: 10px;
                            vertical-align: middle;
                        }
                        .hero {
                            padding: 35px 35px 20px 35px;
                            text-align: center;
                        }
                        .mascot {
                            height: 100px;
                            margin-bottom: 20px;
                        }
                        .title {
                            color: #0f172a;
                            font-size: 24px;
                            font-weight: 800;
                            margin: 0 0 10px 0;
                        }
                        .description {
                            color: #475569;
                            font-size: 15px;
                            line-height: 1.6;
                            margin: 0 0 25px 0;
                            text-align: left;
                        }
                        .credential-card {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 25px 0;
                            text-align: left;
                        }
                        .credential-row {
                            margin-bottom: 12px;
                            font-size: 14px;
                            color: #475569;
                        }
                        .credential-row:last-child {
                            margin-bottom: 0;
                        }
                        .label {
                            font-weight: 600;
                            color: #0f172a;
                            display: inline-block;
                            width: 120px;
                        }
                        .value {
                            font-weight: 500;
                            color: #334155;
                        }
                        .otr-badge {
                            background: #ea580c;
                            color: #ffffff;
                            font-size: 18px;
                            font-weight: 700;
                            padding: 6px 14px;
                            border-radius: 6px;
                            font-family: monospace;
                            display: inline-block;
                        }
                        .btn-primary {
                            display: inline-block;
                            background: #ea580c;
                            color: #ffffff !important;
                            font-weight: 700;
                            font-size: 15px;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 8px;
                            margin: 15px 0;
                            box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);
                        }
                        .warning-text {
                            color: #64748b;
                            font-size: 12px;
                            line-height: 1.5;
                            margin-top: 20px;
                        }
                        .footer {
                            background: #f1f5f9;
                            padding: 30px 20px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-link {
                            color: #ea580c;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 14px;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 12px;
                            margin-top: 15px;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://shiningsparrow.com/logo.png" alt="Shining Sparrow Logo" class="logo" onerror="this.style.display='none'">
                            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Shining Sparrow</h2>
                        </div>
                        <div class="hero">
                            <img src="https://shiningsparrow.com/mascot.png" alt="Shining Sparrow Mascot" class="mascot" onerror="this.style.display='none'">
                            <h1 class="title">Your OTR Code Retrieval</h1>
                            <p class="description">
                                Hi ${user.fullName || 'Learner'},<br><br>
                                We received a request to retrieve your OTR (One Time Registration) code. Here is the login information associated with your account:
                            </p>
                            
                            <div class="credential-card">
                                <div class="credential-row">
                                    <span class="label">Phone Number:</span>
                                    <span class="value">${user.phoneNumber}</span>
                                </div>
                                <div class="credential-row" style="margin-top: 15px; margin-bottom: 5px;">
                                    <span class="label" style="vertical-align: middle;">OTR Code:</span>
                                    <span class="otr-badge">${otr}</span>
                                </div>
                            </div>
                            
                            <a href="http://localhost:3000/login" target="_blank" class="btn-primary">Go to Login</a>
                            
                            <p class="warning-text">
                                * If you did not make this request, you can safely ignore this email or reach out to support if you have concerns.
                            </p>
                        </div>
                        <div class="footer">
                            <a href="https://shiningsparrow.com" target="_blank" class="footer-link">www.shiningsparrow.com</a>
                            <p class="footer-text">
                                Warm Regards,<br>
                                <strong>Team Shining Sparrow</strong><br>
                                &copy; 2026 Shining Sparrow. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            };

            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(`Email has been sent to ${user.email}`);
                }
            });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

export const send_newsletter = async (email: string, subject: string, htmlMessage: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Wrap the HTML message in a proper email template
            const htmlContent = `
                <html lang="en-US">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${subject}</title>
                </head>
                <body style="margin:0; padding:20px; background:#f7f7f7; font-family:Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#fff; padding:25px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <tr>
                            <td>
                                ${htmlMessage}
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            const mailOptions = {
                from: mail,
                to: email,
                subject: subject,
                html: htmlContent,
            };

            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({
                        success: true,
                        message: `Newsletter has been sent to ${email}`,
                        recipients: email
                    });
                }
            });

        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
