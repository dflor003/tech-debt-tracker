/// <reference path="../../../typings/libs.d.ts" />

import mongodb = require('mongodb');
import Q = require('q');
import Promise = Q.Promise;
import MongoClient = mongodb.MongoClient;
import Database = mongodb.Db;
import Collection = mongodb.Collection;

var cachedConnection: MongoConnection;

class MongoConnection {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    clearDatabase(): Promise<any> {
        var dfd = Q.defer<any>();

        this.database.collections((err, collections) => {
            if (err) dfd.reject(err);
            else {
                var innerPromises = collections
                    .filter(collection => collection['namespace'].indexOf('system.') === -1)
                    .map(collection => {
                        var inner = Q.defer<any>();
                        collection.drop((err, result) => {
                            if (err) inner.reject(err);
                            else inner.resolve(result);
                        });

                        return inner.promise;
                    });

                Q
                    .all(innerPromises)
                    .then(dfd.resolve, dfd.reject);
            }
        });

        return dfd.promise;
    }

    getCollection(name: string): Collection {
        return this.database.collection(name);
    }

    static connect(): Promise<MongoConnection> {
        // TODO: Read connection string from config file
        var dbName = 'tetra-db',
            dfd = Q.defer<MongoConnection>();

        if (cachedConnection) {
            dfd.resolve(cachedConnection);
            return dfd.promise;
        }

        MongoClient.connect(`mongodb://localhost:27017/${dbName}`, (err, database) => {
            if (err) {
                console.error(`Failed to connect to MongoDB: ${err}`);
                dfd.reject(err);
            }
            else {
                console.log('Successfully connected to MongoDB!');
                cachedConnection = new MongoConnection(database);
                dfd.resolve(cachedConnection);
            }
        });

        return dfd.promise;
    }

    static disconnect(): void {
        cachedConnection.database.close();
        cachedConnection = null;
        console.log('Disconnected from MongoDB!');
    }
}

export = MongoConnection;