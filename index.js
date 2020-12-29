const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const key = require('./key/key')

const app = express();
const port = process.env.PORT || 5000;

var whitelist = ['https://cinecup-9b0ac.web.app',"http://localhost:3000"]

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200, 
  methods: "POST"
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/',cors(),(req,res) => {
  res.send({working:"True"})
})

app.post('/send',cors(corsOptions) ,(req, res) => {
    const output = `
      <p>
      The movie ${req.body.movieName} has been blacklisted.
      and thus it is now removed from your nominations.
      Kindly nominate any other movie.
      </p>
    `;
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: key.SENDER_EMAIL, // generated ethereal user
          pass: key.SENDER_EMAIL_PASSWORD  // generated ethereal password
      },
      tls:{
        rejectUnauthorized:false
      }
    });
  
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"CineCup" <Cinecup@email.com>', // sender address
        to: req.body.receivers, // list of receivers
        subject: 'Your Nominated Movie Blacklisted', // Subject line
        html: output // html body
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send({success:false,error:error})
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.send({success:true})
    });
    });
  
  app.listen(port, () => console.log(`Server started on port ${port}`));