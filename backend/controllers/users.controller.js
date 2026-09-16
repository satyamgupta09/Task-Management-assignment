const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving users",
    });
  }
};

const getTeamMembers = async (req, res) => {
    try {
      const users = await User.find(
        { role: "team member" },
        {
          name: 1,
          email: 1,
          role: 1,
        },
      );

      return res.status(200).json({
        users,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving team members",
      });
    }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving user",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!name && !email && !password && !role) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (role) {
      user.role = role;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating user",
    });
  }
};

module.exports = { getAllUsers, getTeamMembers, getUserById, createUser, updateUser };
