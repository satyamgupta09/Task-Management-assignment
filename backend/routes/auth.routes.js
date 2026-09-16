const router = require('express').Router();

const { login } = require('../controllers/auth.controller.js');

router.post('/login', login);

//sending role to display UI accoring to user's role.
module.exports = router;
