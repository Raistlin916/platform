var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('localhost', 'platform_db');

var micropostSchema = new Schema({
  content:  {
      type: String,
      required: true
  },
  author: {
      type: ObjectId
  },
  date:   Date
});

var userSchema = new Schema({
	username: {
      type: String,
      required: true,
      unique: true
  },
  pw: {
      type: String,
      required: true
  },
	email: {
      type: String,
      required: true
  },
	joinDate: Date,
});

userSchema.path('email').validate(function (email) {
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'email validate failed.')

var onlineUser = new Schema({
  uid: {
      type: ObjectId,
      unique: true,
      required: true
  },
  loginDate: Date
});


module.exports = {
  Micropost: mongoose.model('micropost', micropostSchema),
  User: mongoose.model('user', userSchema),
  OnlineUser: mongoose.model('onlineUser', onlineUser)
}