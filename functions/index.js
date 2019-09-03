const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const requestModule = require('request');
const Validator = require('validatorjs');
const sgMail = require('@sendgrid/mail');
const apikeys = require('./config/apikeys');

// Config
sgMail.setApiKey(apikeys.sendgridApiKey);

// Verify schema
const schemaRules = {
  name: ['required', 'min:3', 'max:50', "regex:/^[a-záéíóúñü ',.-]+$/i"],
  userContact: [
    'required',
    "regex:/^[a-zA-Z0-9._~\\-+]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^\\+?[0-9 ]{3}-?[0-9 ]{6,12}$/i"
  ],
  message: ['required', 'min:0', 'max:600']
};

exports.validateRecaptcha = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 120,
    memory: '128MB'
  })
  .https.onRequest((req, res) => {
    if (req.method != 'POST') return res.status(404).end();

    return cors(req, res, () =>
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
  });

exports.sendEmail = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 120,
    memory: '128MB'
  })
  .https.onRequest((req, res) => {
    if (req.method != 'POST') return res.status(404).end();

    return cors(req, res, () => {
      // Verify data
      const validation = new Validator(req.body, schemaRules);

      if (validation.fails()) {
        return res.json({
          error: true,
          from: Object.keys(validation.errors.all())
        });
      }

      // Send message
      const data = req.body;
      const msg = {
        to: 'jacob.83@hotmail.com',
        from: 'contacto@iniciaaqui.com',
        subject: 'Nuevo mensaje de visitante',
        text:
          `
          Nombre: ${data.name}
          contacto: ${data.userContact}
          mensaje: ${data.message}
          `,
        html: `
          <p>Nombre: ${data.name}</p>
          <p>contacto: ${data.userContact}</p>
          <p>mensaje: ${data.message}</p>
        `,
      };

      sgMail.send(msg, (error, result) => {
        console.log({ error });

        if (error) {
          return res.json({
            error: true,
            from: ['unhandled']
          })
        }
      });

      // Send success response
      return res.json({
        success: true
      });
    })
  });

