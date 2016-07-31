'use strict';

const logger = require('./logger');
const config = require('./config');
config.on('error', (...args)=>logger.error(...args));

const async = require('async');
const server = require('./server');


const startServer = () => {
  server.start(server.started);
};

server.on('ready', function(server){
  async.series([
    startServer
  ]);
});
