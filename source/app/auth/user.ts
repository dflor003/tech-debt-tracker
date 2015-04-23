/// <reference path="../../../typings/libs.d.ts" />

import Ensure = require('../../common/utils/ensure');
import errors = require('../../common/utils/errors');
import IEntity = require('../../common/persistence/entity');
import Role = require('./roles');
import password = require('./password');
import mongodb = require('mongodb');
import ObjectId = mongodb.ObjectID;
import IPasswordDocument = password.IPasswordDocument;
import Password = password.Password;
import ValidationError = errors.ValidationError;

interface IUserCreationInfo {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    projects: string[];
}

interface IUserDocument {
    _id: ObjectId;
    username: string;
    password: IPasswordDocument;
    firstName: string;
    lastName: string;
    roles?: string[];
    projects?: string[];
}

interface ILoggedInUser {
    id: string;
    firstName: string;
    lastName: string;
    roles: Role[];
}

interface IUserInfo {
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
    private roles: Role[] = [];
    private projects: string[] = [];

    constructor(username: string,
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
        var password = Password.fromPassword(data.password),
            user = new User(data.username, password, data.firstName, data.lastName);

        if (data.roles) {
            data.roles.forEach(role => user.addRole(role));
        }

        if (data.projects) {
            data.projects.forEach(product => user.addProject(product));
        }

        return user;
    }

    static fromDocument(doc: IUserDocument): User {
        var password = new Password(doc.password.salt, doc.password.hash),
            user = new User(doc.username, password, doc.firstName, doc.lastName);

        user.id = doc._id.toHexString();
        user.roles = doc.roles.map(role => Role[role]);
        user.projects = doc.projects.map(prod => prod);
        return user;
    }

    static transformId(id: string): ObjectId {
        return !id ? null : ObjectId.createFromHexString(id);
    }

    getId(): string {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }

    isMatchingPassword(password: string): boolean {
        return this.password.isMatchingPassword(password);
    }

    addRole(role: Role): void {
        role = Ensure.notNull(role, 'Role is required');
        if (this.roles.indexOf(role) !== -1) {
            throw new ValidationError(`User '${this.username}' already has role '${Role[role]}'`);
        }

        this.roles.push(role);
    }

    addProject(productCode: string): void {
        productCode = Ensure.notNullOrEmpty(productCode, 'Product code required').toUpperCase();
        if (this.projects.indexOf(productCode) !== -1) {
            throw new ValidationError(`User '${this.username}' already has product '${productCode}'`);
        }

        this.projects.push(productCode);
    }

    toDocument(): Object {
        return <IUserDocument>{
            _id: User.transformId(this.id),
            username: this.username,
            password: <IPasswordDocument>this.password.toDocument(),
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles.map(role => Role[role]),
            projects: this.projects
        }
    }

    toUserInfo(): IUserInfo {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName
        };
    }

    toLoggedInUser(): ILoggedInUser {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
            projects: this.projects
        }
    }
}

export = User;