$(function() {
  const references = $('button#reference');

  references.click(function(event) {
    const refModal = $('#refModal'),
      modalTitle = $('#modalTitle'),
      modalBody = $('#modalBody'),
      refTitle = event.target.dataset.title,
      refBody = event.target.dataset.content;

    function convertText(text) {
      text = text.replace(/\r\n?|\n/g, '<br>');
      text = text.replace(/<br>\s*<br>/g, '</p><p>');
      text = '<p>' + text + '</p>';
      return text;
    }

    modalTitle.text(refTitle);
    modalBody.html(convertText(refBody));

    setTimeout(function() {
      refModal.modal();
    }, 500);
  });
});
