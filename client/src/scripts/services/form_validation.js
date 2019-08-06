// Este script depende de 'jquery', 'validatorjs' y 'google recaptcha'

$(formValidation);

//🡓 Controla el estado del boton para el formulario
function buttonState(button, state) {
  'use strict';
  state ? $(button).removeAttr('disabled') : $(button).attr('disabled', true);
}

//🡓 Maneja el evento submit
function submit(state, form, formData, formHandler) {
  buttonState($(form).find('[type="submit"]'), false);

  const handler = window[formHandler];

  handler && typeof handler === 'function'
    ? handler(state, form, formData)
    : form.submit();
}

function formValidation() {
  'use strict';

  const forms = $('form[data-validate]');

  const schemaRules = {
    name: ['required', 'min:3', 'max:50', "regex:/^[a-záéíóúñü ',.-]+$/i"],
    userContact: [
      'required', 
      "regex:/^[a-zA-Z0-9._~\\-+]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^\\+?[0-9 ]{3}-?[0-9 ]{6,12}$/i"
    ],
    // phone: ['min:7', 'max:10', 'regex:/^(\\d)+$/i'],
    message: ['required', 'min:0', 'max:600']
  };

  //🡓 Crea un objeto del siguiente tipo:
  //🡓 {field1: rules, field2: rules, ...}
  function fieldsWithRules(fields, temp = {}) {
    fields.each((i, field) => {
      temp[$(field).attr('name')] = schemaRules[$(field).attr('data-check')];
    });

    return temp;
  }

  //🡓 Crea un objeto del siguiente tipo:
  //🡓 {field1: value, field2: value, ...}
  function fieldsWithValues(fields, temp = {}) {
    fields.each((i, field) => {
      temp[$(field).attr('name')] = $(field).val();
    });

    return temp;
  }

  //🡓 Comienza la validacion
  forms.each((i, element) => {
    const form = $(element),
      formFields = form.find('[data-check]'),
      formRules = fieldsWithRules(formFields),
      formRecaptchaSiteKey = form.attr('data-recaptcha-sitekey'),
      formSubmit = $(form.find('[type="submit"]')),
      formHandler = form.attr('data-handler');

    //🡓 Interceptamos el submit
    formSubmit.click(event => {
      event.preventDefault();
      event.stopPropagation();

      let formData = fieldsWithValues(formFields);
      const formValidation = new Validator(formData, formRules);

      if (formValidation.fails()) {
        //🡓 Creamos un array con el nombre de cada input incorrecto
        const errorFields = Object.keys(formValidation.errors.all());

        //🡓 Mostramos los errores en la vista
        errorFields.forEach(field => {
          $(`[name='${field}']`)
            .addClass('is-invalid')
            .keypress(() => $(`[name='${field}']`).removeClass('is-invalid'));
        });
      } else if (formRecaptchaSiteKey) {
        const recaptchaCallbackName = form.attr('data-recaptcha-callback'),
          recaptchaCallback = window[recaptchaCallbackName];

        //🡓 Llama al callback
        recaptchaCallback && typeof recaptchaCallback === 'function'
          ? recaptchaCallback(formRecaptchaSiteKey, state => {
              return submit(state, form, formData, formHandler);
            })
          : console.error('Define the captcha callback to continue');
      } else {
        submit({}, form, formData, formHandler);
      }
    });
  });
}
