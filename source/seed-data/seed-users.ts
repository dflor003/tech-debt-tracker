/// <reference path="../../typings/q/q.d.ts" />

import Q = require('q');
import MongoConnection = require('../common/persistence/mongo-connection');
import Repository = require('../common/persistence/repository');
import AuthHelper = require('../app/auth/auth-helper');
import User = require('../app/auth/user');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        userRepository = new Repository<User>('Users', User),
        users = [
            User.create({
                username: 'BobB',
                password: 'password',
                firstName: 'Bob',
                lastName: 'TheBuilder'
            }),
            User.create({
                username: 'JoeS',
                password: 'password',
                firstName: 'Joe',
                lastName: 'Schmoe'
            }),
            User.create({
                username: 'DaniLF',
                password: 'password',
                firstName: 'Danil',
                lastName: 'Flores'
            }),
        ];

    MongoConnection.connect()
        .then(db =>{
            db
                .clearDatabase()
                .then(() => {
                    // Create users
                    userRepository.createAll(users)
                        .then(results => {
                            console.log(`Created ${users.length} test users`);
                            dfd.resolve(results);
                        })
                        .fail(err => {
                            console.error('Error seeding users');
                            dfd.reject(err);
                        });
                }, dfd.reject);
        })
        .catch(dfd.reject);

    dfd.promise.finally(() => MongoConnection.disconnect());
    return dfd.promise;
}

export = seed;