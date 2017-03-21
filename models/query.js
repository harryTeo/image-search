var mongoose = require('mongoose');

var querySchema = new mongoose.Schema({
  term: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
    // default: Date.now()
  }
});

module.exports = mongoose.model('query', querySchema);