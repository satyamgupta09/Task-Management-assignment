const ServiceType = require('../models/ServiceType');

const getAllServiceTypes = async (req, res) => {

 try{
    let serviceTypes = await ServiceType.find({});
    return res.status(200).json(serviceTypes);
  }
  catch (error) {
    return res.status(500).json({ message: 'Error retrieving service types' });
  }
};

const getServiceTypeById = async (req, res) => {

   try{
    let serviceType = await ServiceType.findById(req.params.id);
    if(!serviceType) {
      return res.status(404).json({ message: 'Service type not found' });
    }
    return res.status(200).json(serviceType);
  }
  catch (error){
    return res.status(500).json({ message: 'Error retrieving service type' });
  }
};

const createServiceType = async (req, res) => {

 try{
    let { name, description } = req.body;
    if(!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    let existingServiceType = await ServiceType.findOne({ name });

    if(existingServiceType) {
      return res.status(400).json({ message: 'Service type with this name already exists' });
    }

    let newServiceType = new ServiceType({name, description});
    await newServiceType.save();

    return res.status(201).json({ serviceType: newServiceType });
  }
  catch (error) {
    return res.status(500).json({ message: 'Error creating service type' });
  }
};

const updateServiceType = async (req, res) => {

  try{
    let { name, description } = req.body;
    if(!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    let serviceType = await ServiceType.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if(!serviceType) {
      return res.status(404).json({ message: 'Service type not found' });
    }
    return res.status(200).json({ serviceType });
  }
  catch (error) {
    return res.status(500).json({ message: 'Error updating service type' });
  }
};

module.exports = { getAllServiceTypes, getServiceTypeById, createServiceType, updateServiceType };
