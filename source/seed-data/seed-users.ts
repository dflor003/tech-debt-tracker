/// <reference path="../../typings/q/q.d.ts" />

import Q = require('q');
import Repository = require('../common/persistence/repository');
import User = require('../app/auth/user');
import Role = require('../app/auth/roles');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        userRepository = new Repository<User>(User),
        users = [
            User.create({
                username: 'BobB',
                password: 'password',
                firstName: 'Bob',
                lastName: 'TheBuilder',
                products: ['omg'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'JoeS',
                password: 'password',
                firstName: 'Joe',
                lastName: 'Schmoe',
                products: ['omg'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'DanilF',
                password: 'password',
                firstName: 'Danil',
                lastName: 'Flores',
                products: ['omg'],
                roles: [Role.TeamMember]
            }),
        ];

    userRepository.createAll(users)
        .then(results => {
            console.log(`Created ${users.length} test users`);
            dfd.resolve(results);
        })
        .fail(err => {
            console.error('Error seeding users');
            dfd.reject(err);
        });

    return dfd.promise;
}

export = seed;