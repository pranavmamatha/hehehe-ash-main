const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  created: {
    type: Date,
    required: true,
    index: true
  },
  tags: [String],
  threatLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient sorting
newsSchema.index({ created: -1, lastUpdated: -1 });

module.exports = mongoose.model('News', newsSchema); 