const TaskTemplate = require('../models/TaskTemplate');

const getAllTaskTemplates = async (req, res) => {
 try {
    const taskTemplates = await TaskTemplate.find({});

    return res.status(200).json({
      taskTemplates
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving task templates'
    });
  }
};

const getTaskTemplateById = async (req, res) => {
try {
    const taskTemplate = await TaskTemplate.findById(req.params.id);

    if (!taskTemplate) {
      return res.status(404).json({
        message: 'Task template not found'
      });
    }

    return res.status(200).json({
      taskTemplate
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving task template'
    })
  }
};

const createTaskTemplate = async (req, res) => {
  try {
      const { name, tasks } = req.body;

      if (!name || !tasks) {
        return res.status(400).json({
          message: 'Name and tasks are required'
        });
      }

      const newTaskTemplate = new TaskTemplate({
        name,
        tasks
      });

      await newTaskTemplate.save();

      return res.status(201).json({
        taskTemplate: newTaskTemplate
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error creating task template'
      });
    }
};

const updateTaskTemplate = async (req, res) => {
    try {
      const { name, tasks } = req.body;

      if (!name || !tasks) {
        return res.status(400).json({
          message: 'Name and tasks are required'
        });
      }

      const taskTemplate = await TaskTemplate.findByIdAndUpdate(
        req.params.id,
        {
          name,
          tasks
        },
        {
          new: true
        }
      );


      if (!taskTemplate) {
        return res.status(404).json({
          message: 'Task template not found'
        });
      }

      return res.status(200).json({
        taskTemplate
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error updating task template'
      });
    }
};

module.exports = { getAllTaskTemplates, getTaskTemplateById, createTaskTemplate, updateTaskTemplate };
