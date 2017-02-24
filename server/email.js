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

module.exports = {
    sendEmail: function(emailObject, cb){
        console.log('enviando email...');
        if(!cb) cb = () => {};
        let mailOptions = {
            from: emailObject.from, // sender address
            to: emailObject.to, // list of receivers
            subject: emailObject.subject, // Subject line
            html: emailObject.html, // html body
            attachments: [{
                filename: emailObject.imagenNombre,
                path: path.join(__dirname, 'emails/imgs/', emailObject.imagenNombre),
                cid: 'imagenEmail'
            }]
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return cb(error, null);
            console.log(`Message ${info.messageId} sent: ${info.response}`);
            cb(null, `Message ${info.messageId} sent: ${info.response}`);
        });
    },
    sendEmailPlain: function(emailObject, cb){
        console.log('enviando email plain...');
        if(!cb) cb = () => {};
        let mailOptions = {
            from: emailObject.from, // sender address
            to: emailObject.to, // list of receivers
            subject: emailObject.subject, // Subject line
            text: emailObject.text // text body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return cb(error, null);
            console.log(`Message ${info.messageId} sent: ${info.response}`);
            cb(null, `Message ${info.messageId} sent: ${info.response}`);
        });
    }
};