/// <reference path="../../../typings/tsd.d.ts" />

import Ensure = require('../../common/utils/ensure');
import IEntity = require('../../common/persistence/entity');
import password = require('./password');
import mongodb = require('mongodb');
import ObjectId = mongodb.ObjectID;
import IPasswordDocument = password.IPasswordDocument;
import Password = password.Password;

interface IUserCreationInfo {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface IUserDocument {
    _id: ObjectId;
    username: string;
    password: IPasswordDocument;
    firstName: string;
    lastName: string;
}

interface ILoggedInUser {
    id: string;
    firstName: string;
    lastName: string;
}

class User implements IEntity {
    private id: string;
    private username: string;
    private password: Password;
    private firstName: string;
    private lastName: string;

    constructor(
        username: string,
        password: Password,
        firstName: string,
        lastName: string) {
        this.username = Ensure.notNullOrEmpty(username, 'Username is required');
        this.password = Ensure.notNull(password, 'Password is required');
        this.firstName = Ensure.notNullOrEmpty(firstName, 'First name is required');
        this.lastName = Ensure.notNullOrEmpty(lastName, 'Last name is required');
    }

    static create(data: IUserCreationInfo): User {
        data = data || <any>{};
        var password = Password.fromPassword(data.password);

        return new User(data.username, password, data.firstName, data.lastName);
    }

    static fromDocument(doc: IUserDocument): User {
        var password = new Password(doc.password.salt, doc.password.hash),
            user = new User(doc.username, password, doc.firstName, doc.lastName);

        user.id = doc._id.toHexString();
        return user;
    }

    static transformId(id: string): ObjectId {
        return ObjectId.createFromHexString(id);
    }

    getId(): string {
        return this.id;
    }

    isMatchingPassword(password: string): boolean {
        return this.password.isMatchingPassword(password);
    }

    toDocument(): Object {
        return {
            _id: ObjectId.createFromHexString(this.id),
            username: this.username,
            password: this.password.toDocument(),
            firstName: this.firstName,
            lastName: this.lastName
        }
    }

    toLoggedInUser(): ILoggedInUser {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName
        }
    }
}

export = User;