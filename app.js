const express = require('express');
const router = express.Router();
const { logger, trafficLogger, errorLogger } = require('./lib/logger');
const { Connection } = require('./lib/connection');

let connection;
const app = express();

// logging middleware
app.use(trafficLogger);

// body parsing middleware
app.use(express.json({extended: false}));
// app.use(express.urlencoded({ extended: true }));

// app routes
router.get('/health', (_, res) => {
  if(connection.connected)
    res.status(200).json({ message: 'healthy' });
  else
    res.status(500).json({ message: 'not healthy' });
});
app.use(router);

// error logging
app.use(errorLogger);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  logger.info(`Server started on port: ${port}`);
  connection = new Connection();
});
