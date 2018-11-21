// Este script depende de 'jquery', 'validatorjs' y 'google recaptcha'

$(formValidation);

function buttonState(button, state) {
  'use strict';
  state ? $(button).removeAttr('disabled') : $(button).attr('disabled', true);
}

function formValidation() {
  'use strict';

  const forms = $('form[data-to-validate]');

  const schemaRules = {
    name: ['required', 'min:3', 'max:50', "regex:/^[A-ZÁÉÍÑÓÚÜ ',.-]+$/i"],
    email: ['required', 'email', 'max:100'],
    phone: ['numeric', 'min:7', 'max:10'],
    message: ['required', 'min:0', 'max:600']
  };

  //🡓 Crea un objeto del siguiente tipo:
  //🡓 {field1: rules, field2: rules, ...}
  function fieldsWithRules(fields, temp = {}) {
    fields.each((i, field) => {
      temp[$(field).attr('name')] = schemaRules[$(field).attr('data-to-check')];
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

  //🡓 Maneja el evento submit
  function submit(form, formData, formHandler) {
    buttonState($(form).find('[type="submit"]'), false);

    const handler = window[formHandler];

    handler && typeof handler === 'function'
      ? handler(form, formData)
      : form.submit();
  }

  //🡓 Comienza la validacion
  forms.each((i, element) => {
    const form = $(element),
      formFields = form.find('[data-to-check]'),
      formRules = fieldsWithRules(formFields),
      formRecaptcha = $(form.find('.is-recaptcha')),
      formSubmit = $(form.find('[type="submit"]')),
      formHandler = form.attr('data-to-handle');

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
      } else if (formRecaptcha.length) {
        const recaptchaId = formRecaptcha.attr('id'),
          widgetId = formRecaptcha.attr('data-widget-id'),
          execute = () => grecaptcha.execute(widgetId);

        //🡓 Crea el callback para la captcha
        window[recaptchaId] = response => {
          if (!response) {
            return execute();
          } else {
            formData['g-recaptcha-response'] = response;
            submit(form, formData, formHandler);
          }
        };

        execute();
      } else {
        submit(form, formData, formHandler);
      }
    });
  });
}
