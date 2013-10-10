var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.Types.ObjectId;

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

var onlineUser = new Schema({
  uid: {
      type: ObjectId,
      unique: true,
      require: true
  },
  loginDate: Date
});


module.exports = {
  Micropost: mongoose.model('micropost', micropostSchema),
  User: mongoose.model('user', userSchema),
  OnlineUser: mongoose.model('onlineUser', onlineUser)
}