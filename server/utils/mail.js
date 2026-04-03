const nodeMailer = require("nodemailer");

const sendEmail = async options => {
    const transporter = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port:process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        },
        connectionTimeout: 10000,
    });

    console.log(options.message);

    // define mail 
    const mainOptions = {
        from: "Mansour Inventory",
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    
    // send the email
    await transporter.sendMail(mainOptions);

}; 

module.exports = sendEmail;