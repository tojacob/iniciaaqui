const functions = require('firebase-functions'),
  cors = require('cors')({ origin: true }),
  requestModule = require('request'),
  apikeys = require('./config/apikeys');

exports.validateRecaptcha = functions
  .region('us-east1')
  .runWith({
    timeoutSeconds: 120,
    memory: '128MB'
  })
  .https.onRequest((req, res) =>
    cors(req, res, () =>
      requestModule(
        {
          url:
            'https://www.google.com/recaptcha/api/siteverify' +
            '?secret=' + apikeys.recaptchaSecretKey +
            '&response=' + req.query.token,
          method: 'POST',
          json: true
        },
        (error, response, body) => {
          res.json(body);
        }
      )
    )
  );
