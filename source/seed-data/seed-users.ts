/// <reference path="../../typings/q/q.d.ts" />

import Q = require('q');
import Enumerable = require('linq');
import UserRepository = require('../app/auth/user-repository');
import User = require('../app/auth/user');
import Role = require('../app/auth/roles');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        userRepository = new UserRepository(),
        users = [
            User.create({
                username: 'BobB',
                password: 'password',
                firstName: 'Bob',
                lastName: 'TheBuilder',
                projects: ['omg'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'JoeS',
                password: 'password',
                firstName: 'Joe',
                lastName: 'Schmoe',
                projects: ['omg'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'DanilF',
                password: 'password',
                firstName: 'Danil',
                lastName: 'Flores',
                projects: ['omg'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'ErnestoD',
                password: 'password',
                firstName: 'Ernesto',
                lastName: 'Diaz',
                projects: ['omg', 'hel', 'ovr'],
                roles: [Role.Manager]
            }),
            User.create({
                username: 'DanM',
                password: 'password',
                firstName: 'Daniel',
                lastName: 'Mann',
                projects: ['ovr'],
                roles: [Role.TeamMember]
            }),
            User.create({
                username: 'PaulS',
                password: 'password',
                firstName: 'Paul',
                lastName: 'Stone',
                projects: ['hel'],
                roles: [Role.TeamMember]
            })
        ];

    userRepository.createAll(users)
        .then(results => {
            var names = Enumerable.from(users).select(user => user.getUsername()).toArray();
            console.log(`Created ${users.length} test users: [ ${names.join(', ')} ]`);
            dfd.resolve(results);
        })
        .fail(err => {
            console.error('Error seeding users');
            dfd.reject(err);
        });

    return dfd.promise;
}

export = seed;