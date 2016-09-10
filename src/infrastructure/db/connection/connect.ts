import {IMongoConfiguration} from './settings';
import {MongoClient} from 'mongodb';
import MongoConnection from './connection';
import validate from './settings';
import {ILogger} from '../util/default-logger';
import logger from '../util/default-logger';

let connection: MongoConnection = null;
let log: ILogger = null;

export async function connect(config: IMongoConfiguration): Promise<MongoConnection> {
    // Use cached connection if there is one already
    if (connection) {
        return connection;
    }

    // Validate and default options
    const connectionInfo = validate(config);
    log = connectionInfo.log;

    try {
        const db = await MongoClient.connect(connectionInfo.connectionString);
        connection = new MongoConnection(db, log);
        log.info(`Connected to MongoDB successfully`);
        return connection;
    } catch (err) {
        log.fatal(`Error connecting to MongoDB: ${err}`);
        throw err;
    }
}

export function getConnection(): MongoConnection {
    if (!connection) {
        throw new Error('Mongo connection is not initialized yet!');
    }

    return connection;
}

export function  getLogger(): ILogger {
    return log || logger();
}

export async function disconnect(): Promise<void> {
    if (!connection) {
        return;
    }

    await connection.close();
    connection = null;
    log.info('Disconnected from MongoDB!');
}
