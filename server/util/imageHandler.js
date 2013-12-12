var path = require('path');
exports.getPath = function(req){
  // express的文件上传是不安全的，需要重写一下
  // http://andrewkelley.me/post/do-not-use-bodyparser-with-express-js.html
  var imagePath = ((req.files || {}).imageData || {}).path;
  return imagePath && path.basename(imagePath);
}