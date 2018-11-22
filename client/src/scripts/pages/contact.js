var submitted = false; // Global var

function contactFormDone(error, form, formData) {
  'use strict';

  const isSuccess = `<div class="alert alert-success" role="alert">
    <h4 class="alert-heading">Su mensaje ha sido enviado</h4>
    <hr>
    <p>
      Recibirá una respuesta lo antes posible.
    </p>
  </div>`;

  const isError = `<div class="alert alert-warning" role="alert">
    <h4 class="alert-heading">El mensaje no ha sido enviado</h4>
    <hr>
    <p>
      Ha ocurrido un error al enviar el formulario. Por favor, intentelo más tarde.
    </p>
  </div>`;

  $('#gform *').fadeOut(2000);

  if (error) {
    $('#gform').prepend(isError);
  } else {
    submitted = true;
    $('#gform').prepend(isSuccess);
  }
}

function recaptchaTest(siteKey, formHandlerCallback) {
  grecaptcha.ready(function() {
    grecaptcha
      .execute(siteKey, {
        action: 'contactPage'
      })
      .then(function(token) {
        $.ajax(
          `https://us-east1-iniciaaqui-68a79.cloudfunctions.net/validateRecaptcha?token=${token}`,
          {
            method: 'POST',
            crossDomain: true,
            success: function(data, textStatus, jqXHR) {
              formHandlerCallback(false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              formHandlerCallback(true);
            }
          }
        );
      });
  });
}
