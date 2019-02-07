const port = 3000;
const config = require('./config/config');
const database = require('./config/database.config');
const express = require('express');

const app = express();
const environment = process.env.NODE_environment || 'development';

database(config[environment]);
require('./config/express')(app, config[environment]);
require('./config/routes')(app);
require('./config/passport')();

app.listen(port, () => console.log(`Server listening on port: ${port}`));