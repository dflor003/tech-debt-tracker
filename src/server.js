"use strict";
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const not_found_error_1 = require('./utils/errors/not-found-error');
const logger_1 = require('./utils/logger');
const uuid_1 = require('./utils/uuid');
const getPort = (defaultPort) => {
    const envPort = parseInt(process.env.PORT, 10);
    return isNaN(envPort) ? defaultPort : envPort;
};
const log = logger_1.default('STARTUP');
function run(root = __dirname) {
    // Setup
    var app = express(), debug = true, port = getPort(3000);
    // Jade
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'jade');
    // CORS for client-side
    app.use(cors());
    app.options('*', cors());
    // Favicon
    app.use(favicon(path.join(root, 'public/favicon.ico')));
    // Request logging
    app.use(morgan('dev'));
    // Cookie parsing
    app.use(cookieParser());
    // Json payload parsing
    app.disable('etag'); // Disables etags for JSON requests
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // Routes
    // Catch-all unhandled route
    app.use((req, res, next) => {
        const message = `Could not find resource: ${req.url}`, err = new not_found_error_1.default(message);
        next(err);
    });
    // Error handler
    const routeLogger = logger_1.default('ROUTE-ERR');
    app.use((err, req, res, next) => {
        const errorId = uuid_1.default(), status = err.status || 500, stack = err.stack;
        // Send error response
        res.status(status).json({
            id: errorId,
            message: err.message || `An error occurred`,
            stack: debug === true
                ? err.stack.split('\n')
                : undefined
        });
        // Log it
        routeLogger.error(`Error in: ${req.method.toUpperCase()} ${req.url}`);
        routeLogger.error(`Error ID: ${errorId} - ${err.message}`);
        routeLogger.error(`Stack   : ${err.stack}`);
    });
    // Start the server
    const server = app.listen(port);
    server
        .on('listening', () => {
        const address = server.address(), bind = typeof address === 'string'
            ? `pipe ${address}`
            : `port ${address.port}`;
        log.info(`Listening on ${bind}`);
    })
        .on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        // Handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                log.error(`${port} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                log.error(`${port} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    })
        .on('SIGINT', () => server.close())
        .on('close', () => {
        process.exit(0);
    });
}
run(path.join(__dirname, '../'));
//# sourceMappingURL=server.js.map