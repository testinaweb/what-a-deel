const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const router = require('./routes/router');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);

app.use((error, req, res, next) => {
  return res.status(error.code).json({ error: error.toString() });
});

module.exports = app;
