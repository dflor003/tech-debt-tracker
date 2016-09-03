import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import {Request, Response} from 'express';
import NotFoundError from './utils/errors/not-found-error';
import HttpError from './utils/errors/http-error';
import logger from './utils/logger';
import uuid from './utils/uuid';

const getPort = (defaultPort: number): number => {
    const envPort = parseInt(process.env.PORT, 10);
    return isNaN(envPort) ? defaultPort : envPort;
};

const log = logger('STARTUP');

function run(root: string = __dirname): void {
    // Setup
    var app = express(),
        debug = true,
        port = getPort(3000);

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
    app.use((req: Request, res: Response, next: Function) => {
        const message = `Could not find resource: ${req.url}`,
            err = new NotFoundError(message);
        next(err);
    });

    // Error handler
    const routeLogger = logger('ROUTE-ERR');
    app.use((err: HttpError, req: Request, res: Response, next: Function) => {
        const errorId = uuid(),
            status = err.status || 500,
            stack = err.stack;

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
            const address = server.address(),
                bind = typeof address === 'string'
                    ? `pipe ${address}`
                    : `port ${address.port}`;
            log.info(`Listening on ${bind}`);
        })
        .on('error', (error: any) => {
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