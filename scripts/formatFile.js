'use strict';
const t2 = require('through2'),
  Vi = require('vinyl');

class FormatFile {
  // Hooks
  constructor(options, chunk, encoding) {
    // File
    this.chunk = chunk;
    this.encoding = encoding;
  }

  // Methods
  getContent() {
    const content = this.chunk.contents.toString(this.encoding);
    return content.trim();
  }

  applyFormat(content) {
    // Titles
    content = content.replace(/capítulo\s\d/gi, str => {
      return '<h2>' + str + '</h2>';
    });

    // Subtitles
    content = content.replace(/\r\n\r\n.+\r\n/gi, str => {
      str = str.replace(/\r|\n/g, '');
      return '\r\n\r\n<h3>' + str + '</h3>\r\n';
    });

    // Paragraphs
    content = content.replace(/\r\n.+(?!(\r\n$))/g, str => {
      if (str.includes('<h3>') && str.includes('</h3>')) {
        return str;
      }

      str = str.replace(/\r\n/g, '\r\n<p>');
      return str + '</p>';
    });

    // Links
    content = content.replace(/\[.+\]\(\/.+\)/g, str => {
      const content = str.split(']('),
        text = content[0].slice(1, content[0].length),
        link = content[1].slice(0, content[1].length - 1);

      str = `<a href="${link}">${text}</a>`;

      return str;
    });

    return content;
  }

  setNewContent(content) {
    this.chunk.contents = new Buffer.from(content);
  }

  formatting(stream, callback) {
    const content = this.getContent(),
      formattedContent = this.applyFormat(content);

    this.setNewContent(formattedContent);

    callback(null, this.chunk);
  }
}

module.exports = options => {
  return t2.obj(function(chunk, encoding, callback) {
    const formatFile = new FormatFile(options, chunk, encoding);

    formatFile.formatting(this, callback);
  });
};
