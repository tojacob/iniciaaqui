'use strict';
const t2 = require('through2'),
  Vi = require('vinyl');

class LargeFile {
  // Hooks
  constructor(options, chunk, encoding) {
    // Options
    this.splitAttribute = options.splitAttribute;
    this.file = {
      name: options.file.name,
      separator: options.file.separator,
      type: options.file.type
    };
    this.showParts = options.showParts || false;

    // File
    this.chunk = chunk;
    this.encoding = encoding;
  }

  // Methods
  getContent() {
    const content = this.chunk.contents.toString(this.encoding);
    return content.trim();
  }

  getSplitAttribute() {
    return new RegExp(this.splitAttribute.exp, this.splitAttribute.flags);
  }

  getPartsOfContent(content, splitAtrr) {
    const contentParts = content.split(splitAtrr);

    if (contentParts[0] === '') {
      contentParts.shift();
    }

    return contentParts;
  }

  createNewFile(stream, content, index) {
    const newFile = new Vi({
      path: `./${this.file.name + this.file.separator + index}.${
        this.file.type
      }`,
      contents: new Buffer.from(content)
    });

    stream.push(newFile);
  }

  createNewFiles(stream, contentParts) {
    contentParts.forEach((part, index) => {
      this.createNewFile(stream, part, index + 1);
    });
  }

  async splitFile(stream, callback) {
    const content = this.getContent(),
      splitAtrr = this.getSplitAttribute(),
      parts = this.getPartsOfContent(content, splitAtrr);

    if (this.showParts) {
      console.log(parts);
    }

    await this.createNewFiles(stream, parts);

    callback();
  }
}

module.exports = options => {
  return t2.obj(function(chunk, encoding, callback) {
    const largeFile = new LargeFile(options, chunk, encoding);

    largeFile.splitFile(this, callback);
  });
};
