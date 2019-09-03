// TODO: crear cloud function para enviar mensaje

function onLoadRecaptcha(recaptchaResponse) {
  const valitateRecaptchaUrl =
    'https://us-central1-iniciaaqui-68a79.cloudfunctions.net/validateRecaptcha';
  const sendEmailUrl =
    'https://us-central1-iniciaaqui-68a79.cloudfunctions.net/sendEmail';

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

    if (!state) return $('#contactForm').prepend(isError);
    else $('#contactForm').prepend(isSuccess);
  }

  // Util. Envia una solicitud al servidor y ejecuta un callback
  function sendWithAjax(path, body, handler) {
    $.ajax(
      path,
      {
        method: 'POST',
        crossDomain: true,
        data: body,
        success: function (data, textStatus, jqXHR) {
          console.log(data);
          if (!data.success) handler(false);
          else handler(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(error);
          handler(false);
        }
      }
    );
  }

  // Main. Validamos el captcha y procedemos
  sendWithAjax(
    `${valitateRecaptchaUrl}?token=${recaptchaResponse}`,
    false,
    function () {
      // Enviamos el mensaje a nuestro correo
      sendWithAjax(
        sendEmailUrl,
        {
          name: $('#name').val(),
          userContact: $('#userContact').val(),
          message: $('#message').val()
        },
        formDone
      );
    }
  );
}
