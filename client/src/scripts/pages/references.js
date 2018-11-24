$(function() {
  const references = $('button#reference');

  references.click(function(event) {
    const refModal = $('#refModal'),
      modalTitle = $('#modalTitle'),
      modalBody = $('#modalBody'),
      refTitle = event.target.dataset.title,
      refBody = event.target.dataset.content;

    function convertText(text, callback) {
      text = text.replace(/\r\n?|\n/g, '<br>');
      text = text.replace(/<br>\s*<br>/g, '</p><p>');
      text = '<p>' + text + '</p>';
      return text;
    }

    function openModal() {
      const preload =
        '<div class="w-100 d-flex justify-content-center"><img src="/assets/images/big-preload.gif"></img></div>';

      modalTitle.text(refTitle);
      modalBody.html(preload);
      refModal.modal();

      setTimeout(() => {
        const mBody = convertText(refBody);
        modalBody.html(mBody);
      }, 600);
    }

    openModal();
  });
});
