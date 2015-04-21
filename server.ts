/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typings/custom/serve-favicon.d.ts" />

import express = require('express');
import favicon = require('serve-favicon');
import path = require('path');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import session = require('express-session');
import bodyParser = require('body-parser');
import passport = require('passport');
import http = require('http');
import errors = require('./source/common/utils/errors');
import debug = require('debug');

import Request = express.Request;
import Response = express.Response;
import NotFoundError = errors.NotFoundError;
import HttpError = errors.HttpError;

// Setup
var app = express(),
    isDev = app.get('env') === 'development';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Configuration
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ secret: 'dragons' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(require('less-middleware')(path.join(__dirname, 'public'), {
    force: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Controllers
import BaseController = require('./source/common/web/base-controller');
import MainController = require('./source/app/controllers/main-controller');

var controllers: BaseController[] = [
    new MainController()
];
controllers.forEach(ctl => ctl.init(app));

// Error handlers
app.use((req: Request, res: Response, next: Function) => {
    var message = `Could not find resource: ${req.url}`,
        err = new NotFoundError(message);
    next(err);
});

app.use((err: HttpError, req: Request, res: Response) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: isDev ? err : {}
    });
});

// Setup server
function getPort(val: any): number {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return 3000;
}

var port = getPort(process.env.PORT) || 3000;
app.set('port', port);
var server = http.createServer(app);

server.listen(port);
server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on('listening', () => {
    var addr = server.address(),
        bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
    debug('Listening on ' + bind);
})
