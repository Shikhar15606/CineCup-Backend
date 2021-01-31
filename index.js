const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const key = require('./key/key');
const jwt = require('jsonwebtoken');
const {
  USERNAME,
  PASSWORD,
  ACCESS_TOKEN_SECRET,
  ALLOWED_ORIGIN,
} = require('./key/key');

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

const accessTokenSecret = ACCESS_TOKEN_SECRET;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post('/token', (req, res) => {
  const { username, password } = req.body;
  const user = USERNAME === username && PASSWORD === password;

  if (user) {
    // generate an access token
    const accessToken = jwt.sign({ username: USERNAME }, accessTokenSecret, {
      expiresIn: '2m',
    });

    res.json({
      accessToken: accessToken,
    });
  } else {
    res.json({
      err: 'Invalid Username Password Combination',
    });
  }
});

app.post('/send', authenticateJWT, (req, res) => {
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

app.post('/startcontest', authenticateJWT, (req, res) => {
  const output = `
    <h7>
    The Contest <b>"${req.body.cname}"</b> started now. Do vote for your favourite movie. 
    </h7>
    <br>
    <br>
    <a href="${ALLOWED_ORIGIN}/leaderboard">Check LeaderBoard</a>
    <br>
    <br>
    <a href="${ALLOWED_ORIGIN}/search">Vote Now</a>
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

app.post('/endcontest', authenticateJWT, (req, res) => {
  const output = `
    <h7>
    The Result of <b>"${req.body.cname}"</b> Declared. Do checkout the complete standings by clicking on the link below 
    </h7>
    <br>
    <br>
    <a href="${ALLOWED_ORIGIN}/history/${req.body.cid}"> Check Results </a>
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
