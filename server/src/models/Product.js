const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cleanDescription: {
    type: String,
    required: true
  },
  technologies: [String],
  tags: {
    type: [String],
    validate: [arrayMinLength, 'Must have at least 4 tags']
  },
  threats: [{
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News'
    },
    status: {
      type: String,
      enum: ['safe', 'warning', 'danger'],
      default: 'warning'
    },
    severity: {
      type: Number,  // 0-100 score
      default: 50
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayMinLength(val) {
  return val.length >= 4;
}

module.exports = mongoose.model('Product', productSchema); 