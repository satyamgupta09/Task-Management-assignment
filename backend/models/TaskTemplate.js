const mongoose = require('mongoose');

const taskTemplateItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
);

const taskTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    tasks: {
      type: [taskTemplateItemSchema],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);
