/// <reference path="../../typings/q/q.d.ts" />

import Q = require('q');
import MongoConnection = require('../common/persistence/mongo-connection');
import Promise = Q.Promise;
import seedProjects = require('./seed-projects');
import seedUsers = require('./seed-users');
import seedDebt = require('./seed-tech-debt');

function seed(): Promise<any> {
    var dfd = Q.defer<any>();

    MongoConnection.connect()
        .then(db => db.clearDatabase())
        .then(() => seedProjects())
        .then(() => seedUsers())
        .then(() => seedDebt())
        .then(dfd.resolve)
        .catch(dfd.reject);

    dfd.promise.finally(() => MongoConnection.disconnect());
    return dfd.promise;
}

export = seed;