'use strict';
const nodemailer = require('nodemailer'),
    claves = require('./secrets/secrets.js'),
    fs = require('fs'),
    path = require('path');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: claves.emailUsername,
        pass: claves.emailPassword
    }
});

let emailFacturaHTML = fs.readFileSync(path.join(__dirname, 'emails', 'factura.html'), 'utf-8');
let mailOptions = {
    from: '"Que tal quieres que hablemos? 👻" <merunasgrincalaitis@gmail.com>', // sender address
    to: 'merunasgrincalaitis@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    html: emailFacturaHTML, // html body
    attachments: [{
        filename: '1920x360.jpg',
        path: path.join(__dirname, 'uploads/_Slider/1920x360.jpg'),
        cid: 'imagenEmail'
    }]
};

function sendEmail(){
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
};

module.exports = sendEmail;