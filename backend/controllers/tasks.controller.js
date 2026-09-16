const Task = require('../models/Task');
const User = require('../models/User');

const getAllTasks = async (req, res) => {
  try {
    let tasks;

    if (
      req.user.role === 'admin' ||
      req.user.role === 'manager'
    ) {
      tasks = await Task.find({})
        .populate('assignedTo', 'name email role')
        .populate('engagement');
    } else {
      tasks = await Task.find({
        assignedTo: req.user.id
      })
        .populate('assignedTo', 'name email role')
        .populate('engagement');
    }

    return res.status(200).json({
      tasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);

    return res.status(500).json({
      message: 'Error retrieving tasks',
      error: error.message
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    let taskFilter = {};

    if (req.user.role === 'team member') {
      taskFilter.assignedTo = req.user.id;
    }

    const openTasks = await Task.find({
      ...taskFilter,
      status: {
        $ne: 'Completed'
      }
    })
      .populate('assignedTo', 'name email role')
      .populate('engagement');

    const overdueTasks = await Task.find({
      ...taskFilter,
      deadline: {
        $lt: new Date()
      },
      status: {
        $ne: 'Completed'
      }
    })
      .populate('assignedTo', 'name email role')
      .populate('engagement');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const tasksDueToday = await Task.find({
      ...taskFilter,
      deadline: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    })
      .populate('assignedTo', 'name email role')
      .populate('engagement');

    const tasksWaitingForClient = await Task.find({
      ...taskFilter,
      status: 'Waiting for Client'
    })
      .populate('assignedTo', 'name email role')
      .populate('engagement');

    const tasksWaitingForReview = await Task.find({
      ...taskFilter,
      status: 'Ready for Review'
    })
      .populate('assignedTo', 'name email role')
      .populate('engagement');


    return res.status(200).json({
      openTasks,
      overdueTasks,
      tasksDueToday,
      tasksWaitingForClient,
      tasksWaitingForReview
    });

  } catch (error) {
    console.error('Dashboard error:', error);

    return res.status(500).json({
      message: 'Error retrieving dashboard information',
      error: error.message
    });
  }
};

const getTaskById = async (req, res) => {

  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('engagement');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }


    if (
      req.user.role === 'team member' &&
      (
        !task.assignedTo ||
        task.assignedTo._id.toString() !== req.user.id
      )
    ) {
      return res.status(403).json({
        message: 'Not authorized to view this task'
      });
    }


    return res.status(200).json({
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      message: 'Error retrieving task',
      error: error.message
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }


    // Only team members can perform normal status updates.
    if (req.user.role !== 'team member') {
      return res.status(403).json({
        message: 'Only team members can update task status'
      });
    }


    // Team member can update only their own task.
    if (
      !task.assignedTo ||
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized to update this task'
      });
    }


    const validStatuses = [
      'Not Started',
      'In Progress',
      'Waiting for Client',
      'Ready for Review',
      'Changes Requested',
      'Completed'
    ];

    const requestedStatus = req.body.status;

    if (!validStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }


    // Team member cannot directly complete or request changes.
    if (
      requestedStatus === 'Completed' ||
      requestedStatus === 'Changes Requested'
    ) {
      return res.status(403).json({
        message:
          'This status can only be set through the review workflow'
      });
    }

    const currentStatus = task.status;

    // flow transitions
    const validTransitions = {

      'Not Started': [
        'In Progress'
      ],

      'In Progress': [
        'Waiting for Client',
        'Ready for Review'
      ],

      'Waiting for Client': [
        'In Progress'
      ],

      'Ready for Review': [
        'Changes Requested',
        'Completed'
      ],

      'Changes Requested': [
        'In Progress'
      ],

      'Completed': []
    };


    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(
        requestedStatus
      )
    ) {
      return res.status(400).json({
        message:
          `Invalid status transition from ${currentStatus} to ${requestedStatus}`
      });
    }


    task.status = requestedStatus;

    task.history.push({
      action: `Status changed to ${requestedStatus}`,
      status: requestedStatus,
      changedBy: req.user.id,
      at: new Date()
    });


    await task.save();


    return res.status(200).json({
      task
    });

  } catch (error) {
    console.error('Update task status error:', error);

    return res.status(500).json({
      message: 'Error updating task status',
      error: error.message
    });
  }
};

const updateTaskAssignee = async (req, res) => {

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }


    //  manager can assign/reassign.
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(403).json({
        message:
          'Not authorized to assign/reassign this task'
      });
    }


    if (!req.body.assignedTo) {
      return res.status(400).json({
        message: 'assignedTo is required'
      });
    }


    const newAssignee = await User.findById(
      req.body.assignedTo
    );


    if (!newAssignee) {
      return res.status(404).json({
        message: 'assignedTo not found'
      });
    }


    // Tasks can only be assigned to team members.
    if (newAssignee.role !== 'team member') {
      return res.status(400).json({
        message:
          'Task can only be assigned to a team member'
      });
    }

    const firstAssignment = !task.assignedTo;

    task.assignedTo = newAssignee._id;

    if (firstAssignment) {
      task.status = 'Not Started';

      task.history.push({
        action: 'Task assigned',
        status: 'Not Started',
        changedBy: req.user.id,
        at: new Date()
      });
    } else {
      task.history.push({
        action: 'Task reassigned',
        changedBy: req.user.id,
        at: new Date()
      });
    }


    await task.save();


    return res.status(200).json({
      task
    });

  } catch (error) {
    console.error(
      'Update task assignee error:',
      error
    );

    return res.status(500).json({
      message: 'Error updating task assignee',
      error: error.message
    });
  }
};

const updateTaskDeadline = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: 'Task not found'
        });
      }


      if (!req.body.deadline) {
        return res.status(400).json({
          message: 'Deadline is required'
        });
      }


      const newDeadline = new Date(
        req.body.deadline
      );


      if (isNaN(newDeadline.getTime())) {
        return res.status(400).json({
          message: 'Invalid deadline'
        });
      }


      task.deadline = newDeadline;


      task.history.push({
        action: 'Deadline changed',
        changedBy: req.user.id,
        at: new Date()
      });


      await task.save();


      return res.status(200).json({
        task
      });

    } catch (error) {
      console.error(
        'Update task deadline error:',
        error
      );

      return res.status(500).json({
        message: 'Error updating task deadline',
        error: error.message
      });
    }
};

const waitingForClient = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: 'Task not found'
        });
      }


      if (
        !task.assignedTo ||
        task.assignedTo.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            'Not authorized to update this task'
        });
      }


      if (task.status !== 'In Progress') {
        return res.status(400).json({
          message:
            'Task must be In Progress to set to Waiting for Client'
        });
      }


      task.status = 'Waiting for Client';


      task.history.push({
        action: 'Waiting for client',
        status: 'Waiting for Client',
        changedBy: req.user.id,
        at: new Date()
      });


      await task.save();


      return res.status(200).json({
        task
      });

    } catch (error) {
      console.error(
        'Waiting for client error:',
        error
      );

      return res.status(500).json({
        message: 'Error updating task status',
        error: error.message
      });
    }
};

const submitTask = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: 'Task not found'
        });
      }


      if (
        !task.assignedTo ||
        task.assignedTo.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            'Not authorized to update this task'
        });
      }


      if (task.status !== 'In Progress') {
        return res.status(400).json({
          message:
            'Task must be In Progress to submit for review'
        });
      }


      task.status = 'Ready for Review';


      task.history.push({
        action: 'Task submitted for review',
        status: 'Ready for Review',
        changedBy: req.user.id,
        at: new Date()
      });


      await task.save();


      return res.status(200).json({
        task
      });

    } catch (error) {
      console.error(
        'Submit task error:',
        error
      );

      return res.status(500).json({
        message:
          'Error submitting task for review',
        error: error.message
      });
    }
};

const approveTask = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: 'Task not found'
        });
      }


      if (task.status !== 'Ready for Review') {
        return res.status(400).json({
          message:
            'Task must be Ready for Review to approve'
        });
      }


      // Manager cannot approve own work.
      if (
        task.assignedTo &&
        task.assignedTo.toString() === req.user.id
      ) {
        return res.status(403).json({
          message:
            'Cannot approve your own work'
        });
      }


      task.status = 'Completed';


      task.history.push({
        action: 'Task approved',
        status: 'Completed',
        changedBy: req.user.id,
        at: new Date()
      });


      await task.save();


      return res.status(200).json({
        task
      });

    } catch (error) {
      console.error(
        'Approve task error:',
        error
      );

      return res.status(500).json({
        message: 'Error approving task',
        error: error.message
      });
    }
};

const requestChanges = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: 'Task not found'
        });
      }


      if (task.status !== 'Ready for Review') {
        return res.status(400).json({
          message:
            'Task must be Ready for Review to request changes'
        });
      }


      task.status = 'Changes Requested';


      task.history.push({
        action: 'Changes requested',
        status: 'Changes Requested',
        changedBy: req.user.id,
        at: new Date()
      });


      await task.save();


      return res.status(200).json({
        task
      });

    } catch (error) {
      console.error(
        'Request changes error:',
        error
      );

      return res.status(500).json({
        message:
          'Error requesting changes on task',
        error: error.message
      });
    }
};

module.exports = { getAllTasks, getDashboard, getTaskById, updateTaskStatus, updateTaskAssignee, updateTaskDeadline, waitingForClient, submitTask, approveTask, requestChanges };
