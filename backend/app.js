const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const clientsRoutes = require('./routes/clients.routes');
const serviceTypesRoutes = require('./routes/serviceTypes.routes');
const taskTemplatesRoutes = require('./routes/taskTemplates.routes');
const engagementsRoutes = require('./routes/engagements.routes');
const tasksRoutes = require('./routes/tasks.routes');
// const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/service-types', serviceTypesRoutes);
app.use('/api/task-templates', taskTemplatesRoutes);
app.use('/api/engagements', engagementsRoutes);
app.use('/api/tasks', tasksRoutes);

// app.use(errorHandler);

module.exports = app;
