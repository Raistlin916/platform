var path = require('path')
, jade = require('jade')
, fs = require('fs');

var autoCompiler = (function(){
  var setting = {}, files = [];
  return {
    start: start,
    fix: fix,
    setPath: setPath
  };

  function start(){
    files.forEach(function(f){
      jade.render(fs.readFileSync(path.join(setting.src, f + '.jade')), function (err, html) {
        if (err) throw err;
        fs.writeFileSync(path.join(setting.des, f + '.html'), html);
      });
    });
  }

  function fix(filename){
    files = files.concat(filename);
  }

  function setPath(src, des){
    setting.src = src;
    setting.des = des || src;
  }

})();


exports.autoCompiler = autoCompiler;