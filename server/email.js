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

function sendEmail(from, to, subject, html, imagenNombre, cb){
    console.log('enviando email...');
    let mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
        attachments: [{
            filename: imagenNombre,
            path: path.join(__dirname, 'emails/imgs/', imagenNombre),
            cid: 'imagenEmail'
        }]
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return cb(error, null);
        cb(null, `Message ${info.messageId} sent: ${info.response}`);
    });
};

module.exports = sendEmail;