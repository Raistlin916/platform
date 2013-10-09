var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

mongoose.connect('localhost', 'platform_db');

var micropostSchema = new Schema({
  content:  String,
  author: String,
  date:   Date
});

var Micropost = mongoose.model('micropost', micropostSchema);


module.exports = {
  Micropost: Micropost
}