// Este script depende de 'jquery', 'validatorjs' y 'google recaptcha'

$(formValidation);

//🡓 Controla el estado del boton para el formulario
function buttonState(button, state) {
  'use strict';
  state ? $(button).removeAttr('disabled') : $(button).attr('disabled', true);
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
      formSubmit = $(form.find('[type="submit"]'));

    //🡓 Interceptamos el submit
    formSubmit.click(event => {
      event.preventDefault();
      event.stopPropagation();

      //🡓 Desactivamos el boton
      buttonState(formSubmit, false);

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

        //🡓 Reactivamos en boton
        buttonState(formSubmit, true);
      } else {
        grecaptcha.execute();
      }
    });
  });
}
