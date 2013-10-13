var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('localhost', 'platform_db');

var MicropostSchema = new Schema({
  content:  {
      type: String,
      required: true
  },
  author: {
      type: ObjectId,
      required: true,
      ref: 'User'
  },
  date: Date
});

var UserSchema = new Schema({
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

UserSchema.path('email').validate(function (email) {
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'email validate failed.')

var OnlineUser = new Schema({
  uid: {
      type: ObjectId,
      unique: true,
      required: true
  },
  loginDate: Date
});


module.exports = {
  Micropost: mongoose.model('Micropost', MicropostSchema),
  User: mongoose.model('User', UserSchema),
  OnlineUser: mongoose.model('OnlineUser', OnlineUser)
}