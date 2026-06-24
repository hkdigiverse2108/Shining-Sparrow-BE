import nodemailer from 'nodemailer';
import { config } from './config';

const mail = 'pramit6515@gmail.com';
const password = 'iehy rywb ueal gapl';

const option = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: mail,
        pass: password
    }
};

const transPorter = nodemailer.createTransport(option);

const test = async () => {
    try {
        const mailOptions = {
            from: mail,
            to: 'pramit6515@gmail.com', // send to self for testing
            subject: "Test Mail from Shining Sparrow",
            text: "SMTP test is successful!"
        };

        transPorter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.error("Nodemailer error:", err);
            } else {
                console.log("Email sent successfully! Response:", data);
            }
        });
    } catch (e) {
        console.error("Error in test:", e);
    }
};

test();
