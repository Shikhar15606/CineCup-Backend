const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const key = require('./key/key');

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// var whitelist = ['https://cinecup-9b0ac.web.app']

// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log(origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   optionsSuccessStatus: 200, 
//   methods: "POST"
// }

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dev-3yqn-gsx.au.auth0.com/.well-known/jwks.json'
}),
audience: 'https://cinecup-backend.herokuapp.com',
issuer: 'https://dev-3yqn-gsx.au.auth0.com/',
algorithms: ['RS256']
});

app.options('*', cors());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "https://cinecup-9b0ac.web.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(jwtCheck);

app.get('/',cors(),(req,res) => {
  res.send({working:"True"})
})

app.post('/send',cors() ,(req, res) => {
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
        from: '"CineCup" Cinecup@email.com', // sender address
        to: req.body.receivers, // list of receivers
        subject: 'Your Nominated Movie Blacklisted', // Subject line
        html: output // html body
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send({success:false,error:error})
        }
      else  
        res.send({success:true})
    });
    });
  
  app.listen(port, () => console.log(`Server started on port ${port}`));