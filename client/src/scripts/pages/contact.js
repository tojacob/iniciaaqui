// TODO: crear cloud function para validar captcha
// TODO: crear cloud function para enviar mensaje

function onLoadRecaptcha(recaptchaResponse) {
  console.log('token', recaptchaResponse);
  const valitateRecaptchaUrl =
    'https://us-east1-iniciaaqui-68a79.cloudfunctions.net/validateRecaptcha';

  // Util. Modifica la vista según el resultado de la operación
  function formDone(state) {
    'use strict';

    const isSuccess =
      `<div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Su mensaje ha sido enviado</h4>
        <hr>
        <p>
          Pronto recibirá una respuesta.
        </p>
      </div>`;

    const isError =
      `<div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">El mensaje no ha sido enviado</h4>
        <hr>
        <p>
          Ha ocurrido un error al enviar el formulario. Por favor, intentelo más tarde.
        </p>
      </div>`;

    $('#contactForm *').fadeOut(2000);

    if (!state) $('#contactForm').prepend(isError);
    else $('#contactForm').prepend(isSuccess);
  }

  // Util. Envia una solicitud al servidor y ejecuta un callback
  function sendWithAjax(path, handler) {
    $.ajax(
      path,
      {
        method: 'POST',
        crossDomain: true,
        success: function (data, textStatus, jqXHR) {
          if (!data.success) handler(false);
          else handler(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          handler(false);
        }
      }
    );
  }

  // Util. Maneja el estado del formulario
  function formHandler(status) {
    if (!status) return formDone(status);

    // Enviamos el mensaje a nuestro correo
    // sendWithAjax('#', formDone);

    // Finalizamos
    return formDone(status);
  }

  // Main. Validamos el captcha y procedemos
  sendWithAjax(
    `${valitateRecaptchaUrl}?token=${recaptchaResponse}`,
    formHandler
  );
}
