var crypto = require('crypto');

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

function extend(target) {
		var args, isOverwrite, source, key;
		args = [].slice.call(arguments);
		if( typeof args[args.length-1] == 'boolean' ){
			isOverwrite = args.splice(args.length-1)[0];
		}
		source = args.slice(1,args.length);
		source.forEach(function(item){
			for( key in item ){
				if( target[key] == undefined || isOverwrite ){
					target[key] = item[key];
				}
			}
		});
		return target;
	}

module.exports = {
	md5: md5,
	extend: extend
}