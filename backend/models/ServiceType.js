const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Recurring', 'One-time'],
      required: true
    },
    taskTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskTemplate',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
