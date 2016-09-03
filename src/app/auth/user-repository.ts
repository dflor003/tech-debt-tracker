/// <reference path="../../../typings/libs.d.ts" />

import User = require('./user');
import Q = require('q');
import Enumerable = require('linq');
import mongodb = require('mongodb');
import Repository = require('../../common/persistence/repository');
import Promise = Q.Promise;

import ObjectId = mongodb.ObjectID;

class UserRepository extends Repository<User> {
    constructor() {
        super(User);
    }

    findUsersWithIds(ids: string[]): Promise<User[]> {
        var idsToSearch = Enumerable
            .from(ids)
            .distinct()
            .select(id => ObjectId.createFromHexString(id))
            .toArray();

        return this.findAll({
            _id: { $in: idsToSearch }
        })
        .execute();
    }
}

export = UserRepository;