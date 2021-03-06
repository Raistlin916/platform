var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.Types.ObjectId
  , md5 = require('../server/util').md5;

var PostSchema = new Schema({
  content:  {
    type: String
  },
  todoList: [TodoSchema],
  author: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  praisedUserList: [{
    type: ObjectId,
    unique: true,
    ref: 'User'
  }],
  gid: {
    type: ObjectId,
    required: true
  },
  type: String,
  title: String,
  img: String,
  date: {
    type: Date,
    default: Date.now
  }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  versionKey: false,
  id: false 
});


var TodoSchema = new Schema({
  content: String,
  hasDone: {
    type: Boolean,
    default: false
  },
  doneAt: Date
}, {
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
  detail: {
    github: String,
    weibo: String,
    website: String
  },
	joinDate: Date,
}, {
  versionKey: false,
  id: false
});

UserSchema.path('email').validate(function (email) {
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'email validate failed.');

if (!UserSchema.options.toObject) UserSchema.options.toObject = {};
UserSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret.pw;
}

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

var GroupSchema = new Schema({
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
  bgPath: String,
  createDate: Date
}, {
  versionKey: false
});

var UserGroup = new Schema({
  uid: {
    type: ObjectId,
    required: true,
    unique: true
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
  Post: mongoose.model('Post', PostSchema),
  User: mongoose.model('User', UserSchema),
  OnlineUser: mongoose.model('OnlineUser', OnlineUser),
  Group: mongoose.model('Group', GroupSchema),
  UserGroup: mongoose.model('UserGroup', UserGroup),
  Todo: mongoose.model('Todo', TodoSchema)
}