const nodeMailer = require('nodemailer');

const sendEmail = async options => {
    //1. create transporter:
         const transporter = nodeMailer.createTransport({

             host: process.env.Email_HOST,
             port: 465,
             //secure: true, 
             auth: {
                 user: process.env.Email_USERNAME,
                 pass: process.env.Email_PASSWORD
             }
         })

    //2. Define the email Options:
         const mailOptions = {
             from: 'Nik Ydv <nik@gmail.com>',
             to: options.email,
             subject: options.subject,
             text: options.message
         }

    //3. Actually send email:
        await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;