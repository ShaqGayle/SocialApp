var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var topicSchema = new Schema({
  // topic: { type: String, required: true},
  message: { type: String, required: true},
  created_At: Date,
  isDeleted: false,
  author: {type: Schema.Types.ObjectId, required: true}
});

topicSchema.pre('save', function(next) {
  if(!this.created_At) this.created_At = new Date();

      next();
});

module.exports = mongoose.model('topic', topicSchema);
