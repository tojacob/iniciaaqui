const functions = require('firebase-functions'),
  cors = require('cors')({ origin: true }),
  requestModule = require('request'),
  apikeys = require('./config/apikeys');

exports.validateRecaptcha = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB'
  })
  .region('us-east1')
  .https.onRequest((req, res) =>
    cors(req, res, () => {
      requestModule(
        {
          url: 'https://www.google.com/recaptcha/api/siteverify',
          method: 'POST',
          body: {
            secret: apikeys.recaptchaSecretKey,
            response: req.query.token
          }
        },
        (error, response, body) => {
          res.json({ error, response, body });
        }
      );
    })
  );
