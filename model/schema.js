var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

mongoose.connect('localhost', 'platform_db');

var micropostSchema = new Schema({
  content:  String,
  author: String,
  date:   Date
});

var userSchema = new Schema({
	username: String,
	email: String,
	pw: String,
	joinDate: Date,
});


module.exports = {
  Micropost: mongoose.model('micropost', micropostSchema),
  User: mongoose.model('user', userSchema)
}