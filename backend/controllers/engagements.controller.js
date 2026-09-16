const Engagement = require("../models/Engagement");
const Client = require("../models/Client");
const ServiceType = require("../models/ServiceType");
const Task = require("../models/Task");
const mongoose = require("mongoose");

const getAllEngagements = async (req, res) => {
    try {
      const engagements = await Engagement.find({});

      return res.status(200).json({
        engagements,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving engagements",
      });
    }
};

const getEngagementById = async (req, res) => {
   try {
      const engagement = await Engagement.findById(req.params.id);

      if (!engagement) {
        return res.status(404).json({
          message: "Engagement not found",
        });
      }

      return res.status(200).json({
        engagement,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving engagement",
      });
    }
};

const createEngagement = async (req, res) => {
  const { client, serviceType, type, period } = req.body;
if (!client || !serviceType || !type) {
    return res.status(400).json({
      message: "Client, service type and type are required",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingClient = await Client.findById(client).session(session);

    if (!existingClient) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Client not found",
      });
    }

    const existingService = await ServiceType.findById(serviceType)
      .populate("taskTemplate")
      .session(session);

    if (!existingService) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Service type not found",
      });
    }

    if (type === "Recurring") {
      if (!period) {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Period is required for recurring engagement",
        });
      }

      const existingEngagement = await Engagement.findOne({
        client: client,
        serviceType: serviceType,
        period: period,
        type: "Recurring",
      }).session(session);

      if (existingEngagement) {
        await session.abortTransaction();

        return res.status(409).json({
          message:
            "Recurring engagement already exists for this client, service and period",
        });
      }
    }

    const engagementResult = await Engagement.create(
      [
        {
          client: client,
          serviceType: serviceType,
          type: type,
          period: period,
        },
      ],
      {
        session,
      },
    );

    const newEngagement = engagementResult[0];

    const taskTemplate = existingService.taskTemplate;

    if (!taskTemplate) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Task template not found",
      });
    }

    const tasks = taskTemplate.tasks.map((templateTask) => {
      return {
        title: templateTask.name,

        engagement: newEngagement._id,

        status: "Not Started",

        history: [
          {
            status: "Not Started",
            changedBy: req.user.id,
            changedAt: new Date(),
          },
        ],
      };
    });

    await Task.insertMany(tasks, {
      session,
    });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Engagement created successfully",
      engagement: newEngagement,
    });
  } catch (error) {

  console.error('Error creating engagement:', error);

  await session.abortTransaction();

  return res.status(500).json({
    message: error.message
  });

} finally {

  await session.endSession();

}
};

const updateEngagement = async (req, res) => {


  try {
    const { client, serviceType, type, period } = req.body;

    if (!client && !serviceType && !type && !period) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    const engagement = await Engagement.findById(req.params.id);

    if (!engagement) {
      return res.status(404).json({
        message: "Engagement not found",
      });
    }

    if (client) {
      engagement.client = client;
    }

    if (serviceType) {
      engagement.serviceType = serviceType;
    }

    if (type) {
      engagement.type = type;
    }

    if (period) {
      engagement.period = period;
    }

    await engagement.save();

    return res.status(200).json({
      engagement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating engagement",
    });
  }
};

const createNextPeriodEngagement = async (req, res) => {

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const engagement = await Engagement.findById(req.params.id)
        .populate("serviceType")
        .session(session);

      if (!engagement) {
        await session.abortTransaction();

        return res.status(404).json({
          message: "Engagement not found",
        });
      }

      if (engagement.type !== "Recurring") {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Engagement is not recurring",
        });
      }

      const nextPeriod = null;

      await session.commitTransaction();

      return res.status(201).json({
        message: "Next period engagement created successfully",
      });
    } catch (error) {
      await session.abortTransaction();

      return res.status(500).json({
        message: "Error creating next period engagement",
      });
    } finally {
      await session.endSession();
    }
};

module.exports = { getAllEngagements, getEngagementById, createEngagement, updateEngagement, createNextPeriodEngagement };
