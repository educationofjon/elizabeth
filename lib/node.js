/**
 * basic webserver
 * https://github.com/rojii/blueangel
 * Copyright (C) 2022, Jonathan Gonzales MIT License
 */

'use strict';

const assert = require('bsert');
const Logger = require('blgr');
const path = require('path');
const {Server} = require('bweb');
const Validator = require('bval');

class Node extends Server {
  constructor(options) {
    super();

    this.options = new NodeOptions(options);
    this.logger = this.options.logger;

    this.init();
  }

  init() {
    this.on('request', (req, res) => {
      if (req.method === 'POST' && req.pathname === '/')
        return;

      this.logger.debug('Request for method=%s path=%s (%s).',
      req.method, req.pathname, req.socket.remoteAddress);
    });

    this.on('listening', (address) => {
      this.logger.debug('HTTP server listening on %s (port=%d)',
      address.address, address.port);
    });

    this.initRouter();
  }

  initRouter() {
    this.use(this.bodyParser({
      type: 'json'
    }));

    this.use(this.jsonRPC());
    this.use(this.router());

    this.error((err, req, res) => {
      const code = err.statusCode || 500;
      res.json(code, {
        error:{
          type: err.type,
          code: err.code,
          message: err.message
        }
      });
    });

    this.get('/', async (req, res) => {
      res.json(200, {
        memory: this.logger.memoryUsage()
      })
    });
  }
}

class NodeOptions {
  constructor(options) {
    this.logger = new Logger('debug');

    if (options)
      this.fromOptions(options);
  }

  fromOptions(options) {
    if (options.logger != null) {
      this.logger = options.logger;
    }
  }
}

module.exports = Node;
