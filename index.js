const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const key = require('./key/key');
const admin = require('firebase-admin');
const { ALLOWED_ORIGIN } = require('./key/key');
const FirebaseConfig = {
  type: key.type,
  project_id: key.project_id,
  private_key_id: key.private_key_id,
  private_key: key.private_key,
  client_email: key.client_email,
  client_id: key.client_id,
  auth_uri: key.auth_uri,
  token_uri: key.token_uri,
  auth_provider_x509_cert_url: key.auth_provider_x509_cert_url,
  client_x509_cert_url: key.client_x509_cert_url,
};
admin.initializeApp({
  credential: admin.credential.cert(FirebaseConfig),
});

const db = admin.firestore();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var whitelist = [ALLOWED_ORIGIN];

var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  methods: 'POST',
};

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: key.SENDER_EMAIL, // generated ethereal user
    pass: key.SENDER_EMAIL_PASSWORD, // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.get('/', (req, res) => {
  res.send({ working: 'True' });
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(cors(corsOptions));

function checkAdmin(req, res, next) {
  if (req.headers.authtoken) {
    admin
      .auth()
      .verifyIdToken(req.headers.authtoken)
      .then(decodedToken => {
        const uid = decodedToken.email;
        let userRef = db.collection('users').doc(uid);
        userRef
          .get()
          .then(function (doc) {
            if (doc.exists) {
              if (doc.data().IsAdmin) {
                next();
              } else {
                res.status(403).send('Unauthorized');
              }
            } else {
              res.status(403).send('Unauthorized');
            }
          })
          .catch(function (error) {
            res.status(403).send('Unauthorized');
          });
      })
      .catch(() => {
        res.status(403).send('Unauthorized');
      });
  } else {
    res.status(403).send('Unauthorized');
  }
}

app.post('/send', checkAdmin, (req, res) => {
  const output = `
      <p>
      The movie ${req.body.movieName} has been blacklisted.
      and thus it is now removed from your nominations.
      Kindly nominate any other movie.
      </p>
      <br>
      <h5>Thanks & Regards</h5>
      <h5>CineCup Team</h5>
    `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"CineCup" Cinecup@email.com', // sender address
    to: req.body.receivers, // list of receivers
    subject: 'Your Nominated Movie Blacklisted', // Subject line
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send({ success: false, error: error });
    } else res.send({ success: true });
  });
});

app.post('/startcontest', checkAdmin, (req, res) => {
  const output = `
    <h7>
    The Contest <b>"${req.body.cname}"</b> started now. Do vote for your favourite movie. 
    </h7>
    <br>
    <br>
    <a href="https://cinecup-9b0ac.web.app/leaderboard">Check LeaderBoard</a>
    <br>
    <br>
    <a href="https://cinecup-9b0ac.web.app/search">Vote Now</a>
    <h5>Thanks & Regards</h5>
    <h5>CineCup Team</h5>
    `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"CineCup" Cinecup@email.com', // sender address
    to: req.body.receivers, // list of receivers
    subject: 'New Contest Started', // Subject line
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send({ success: false, error: error });
    } else res.send({ success: true });
  });
});

app.post('/endcontest', checkAdmin, (req, res) => {
  const output = `
    <h7>
    The Result of <b>"${req.body.cname}"</b> Declared. Do checkout the complete standings by clicking on the link below 
    </h7>
    <br>
    <br>
    <a href="https://cinecup-9b0ac.web.app/history/${req.body.cid}"> Check Results </a>
    <br>
    <h5>Thanks & Regards</h5>
    <h5>CineCup Team</h5>
    `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"CineCup" Cinecup@email.com', // sender address
    to: req.body.receivers, // list of receivers
    subject: 'Results Declared', // Subject line
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send({ success: false, error: error });
    } else res.send({ success: true });
  });
});

app.listen(port, () => console.log(`Server started on port ${port}`));
