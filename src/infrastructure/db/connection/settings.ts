import * as url from 'url';
import {ILogger} from '../util/default-logger';
import defaultLogger from '../util/default-logger';

export interface IMongoConfiguration {
    url?: string;
    host?: string | string[];
    database?: string;
    username?: string;
    password?: string;
    logger?: ILogger
}

export interface IMongoSettings {
    connectionString: string;
    log: ILogger;
}

export default function validate(opts: IMongoConfiguration): IMongoSettings {
    // Extract and default params first
    opts = opts || {};
    let url = opts.url,
        host = opts.host,
        database = opts.database,
        username = opts.username,
        password = opts.password,
        log = opts.logger || defaultLogger();

    // If url passed, ignore the rest of the stuff and just use that
    if (typeof url === 'string') {
        return { connectionString: url, log };
    }

    // Otherwise, build a connection string from the parts
    const hosts: string[] = typeof host === 'string' ? [host] : host;
    const connectionString = buildConnectionString(hosts, username, password, database);
    return { connectionString, log };
}

export function buildConnectionString(hosts: string[], username: string,  password: string, database) {
    const authString = !!username ? undefined : `${username}:${password || ''}`;

    return url.format({
        protocol: 'mongodb:',
        slashes: true,
        auth: authString,
        host: hosts.join(','),
        pathname: database
    });
}