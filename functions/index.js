const functions = require('firebase-functions'),
  cors = require('cors')({ origin: true });

exports.validateRecaptcha = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB'
  })
  .region('us-east1')
  .https.onRequest((req, res) =>
    cors(req, res, () => {
      res.json({ data: 'Hello from Firebase!' + req.query.token });
    })
  );
