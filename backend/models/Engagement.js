const mongoose = require('mongoose');

const engagementSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    serviceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceType',
      required: true
    },
    type: {
      type: String,
      enum: ['Recurring', 'One-time'],
      required: true
    },
    period: {
      type: String
    }
  },
  { timestamps: true }
);

engagementSchema.index(
  { client: 1, serviceType: 1, period: 1 },
  { unique: true, partialFilterExpression: { period: { $exists: true } } }
);

module.exports = mongoose.model('Engagement', engagementSchema);
