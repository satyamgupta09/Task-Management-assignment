const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema(
  {
    // Basic audit/history 
    action: {
       type: String,
       required: true 
      },
    status: {
      type: String
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date,
      default: Date.now 
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    engagement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engagement',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: [
        'Not Started',
        'In Progress',
        'Ready for Review',
        'Completed',
        'Waiting for Client',
        'Changes Requested'
      ],
      default: 'Not Started'
    },
    history: {
      type: [taskHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
