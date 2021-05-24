# CineCup Backend

- Rest API for CineCup [Github Repository](https://github.com/Shikhar15606/cinecup) , [CineCup](https://cinecup-9b0ac.web.app/)
- Provides Mailing Service for CineCup
- Tech-Stack Used
  - Node JS
  - Express JS

---

## Endpoints

- GET [/](https://cinecup-backend.herokuapp.com/)

  - Public Endpoint
  - Just to Check that backend is correctly deployed on Heroku

- POST /send
  - Private Endpoint
  - Requires an authentication token provided by firebase, which is then used to check that the authentication token corresponds to an admin account
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to those users whose nominated movies were blacklisted by admin
- POST /startcontest
  - Private Endpoint
  - Requires an authentication token provided by firebase, which is then used to check that the authentication token corresponds to an admin account
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to all the registered users to notify them about the start of a new contest
- POST /endcontest
  - Private Endpoint
  - Requires an authentication token provided by firebase, which is then used to check that the authentication token corresponds to an admin account
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to all the registered users to notify them about the declaration of results of a contest

---

## How to Setup

```bash
git clone https://github.com/Shikhar15606/CineCup-Backend.git
cd CineCup-Backend
npm install
```

Then you need to have your own file for keys for that follow the steps given below

- Go to the key folder in the CineCup-Backend Folder
- Make a file named dev.js in the key folder
- Insert the code given below in your dev.js file

```JS
module.exports = {
    SENDER_EMAIL: 'Enter your Email id here',
    SENDER_EMAIL_PASSWORD: 'Enter your Email id Password',
    ALLOWED_ORIGIN:'http://localhost:3000'
    // Your Firebase account details
    type:'Get from firebase',
    project_id:'Get from firebase',
    private_key_id:'Get from firebase',
    private_key:'Get from firebase',
    client_email:'Get from firebase',
    client_id:'Get from firebase',
    auth_uri:'Get from firebase',
    token_uri:'Get from firebase',
    auth_provider_x509_cert_url:'Get from firebase',
    client_x509_cert_url:'Get from firebase'
}
```

- Make sure that the email that you have entered in the above code has login enabled with less secure apps.
- Now you are ready to go just run

```bash
npm run dev
```

- This will start the server on port 5000
