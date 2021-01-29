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
- POST /token
  - Private Endpoint
  - Requires Username and Password
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Returns an Access Token which expires in 2 minutes
- POST /send
  - Private Endpoint
  - Requires Access Token
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to those users whose nominated movies were blacklisted by admin
- POST /startcontest
  - Private Endpoint
  - Requires Access Token
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to all the registered users to notify them about the start of a new contest
- POST /endcontest
  - Private Endpoint
  - Requires Access Token
  - Accessible only when request is made from [https://cinecup-9b0ac.web.app/](https://cinecup-9b0ac.web.app/)
  - Sends Email to all the registered users to notify them about the declaration of results of a contest
