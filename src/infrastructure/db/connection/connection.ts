import {Db, Collection} from 'mongodb';
import {ILogger} from '../util/default-logger';

export default class MongoConnection {
    private database: Db;
    private log: ILogger;

    constructor(database: Db, log: ILogger) {
        this.database = database;
        this.log = log;
    }

    async clearDatabase(): Promise<void> {
        // Get all collections that are not in the system namespace
        const collections = await this.database.collections();
        const collectionsToDrop = collections.filter(c => c.namespace.indexOf('system.') === -1);
        const collectionNames = `[${collectionsToDrop.map(c => `'${c.collectionName}'`).join(',')}]`;

        // Drop it like it's hot
        const log = this.log;
        log.debug(`Began dropping collections ${collectionNames}`);
        await Promise.all(collectionsToDrop.map(c => c.drop()));
        log.debug(`Dropped collections ${collectionNames}`);
    }

    async close(): Promise<any> {
        await this.database.close();
        this.database = null;
    }

    getCollection(name: string): Collection {
        return this.database.collection(name);
    }
}