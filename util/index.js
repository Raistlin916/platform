var crypto = require('crypto');

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};


exports.md5 = md5;