const Client = require('../models/Client');

const getAllClients = async (req, res) => {

    try {
      const clients = await Client.find({});

      return res.status(200).json({
        clients
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving clients'
      });
    }
};

const getClientById = async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);

      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }

      return res.status(200).json({
        client
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving client'
      });
    }
};

const createClient = async (req, res) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: 'Name and email are required'
        });
      }

      const existingClient = await Client.findOne({
        email
      });

      if (existingClient) {
        return res.status(400).json({
          message: 'Client with this email already exists'
        });
      }

      const newClient = new Client({
        name,
        email
      });

      await newClient.save();

      return res.status(201).json({
        client: newClient
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error creating client'
      });
    }
};

const updateClient = async (req, res) => {    
    try { 
      const { name, email } = req.body;

      if (!name && !email) {
        return res.status(400).json({
          message:
            'At least one of name or email is required to update'
        });
      }

      const client = await Client.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email
        },
        {
          new: true
        }
      );

      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }

      return res.status(200).json({
        client
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error updating client'
      });
    }
};

module.exports = { getAllClients, getClientById, createClient, updateClient };
