var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.Types.ObjectId
  , md5 = require('../util').md5;

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
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  versionKey: false,
  id: false 
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
}, {
  versionKey: false,
  id: false
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
}, {
  versionKey: false
});

var Group = new Schema({
  chomd: {
    type: String
  },
  pw: {
    type: String,
  },
  desc: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createDate: Date
}, {
  versionKey: false
});

var UserGroup = new Schema({
  uid: {
    type: ObjectId,
    required: true
  },
  gid: {
    type: ObjectId,
    required: true
  },
  joinDate: Date,
}, {
  versionKey: false
});



module.exports = {
  Micropost: mongoose.model('Micropost', MicropostSchema),
  User: mongoose.model('User', UserSchema),
  OnlineUser: mongoose.model('OnlineUser', OnlineUser),
  Group: mongoose.model('Group', Group),
  UserGroup: mongoose.model('UserGroup', UserGroup)
}