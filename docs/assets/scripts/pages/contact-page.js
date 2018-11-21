var submitted = false;

const isDone = `<div class="alert alert-success" role="alert">
  <h4 class="alert-heading">Su mensaje ha sido enviado</h4>
  <hr>
  <p>
    Recibirá una respuesta lo antes posible. 
  </p>
</div>`;

$(function() {
  $('#gform').on('submit', function(e) {
    $('#gform *').fadeOut(2000);
    $('#gform').prepend(isDone);
  });

  console.log('hey there! 1');
});
