/// <reference path="../../../typings/libs.d.ts" />

import errors = require('../../utils/errors/errors');
import IValueObject = require('../../infrastructure/persistence/value-object');
import ValidationError = errors.ValidationError;
import AuthHelper = require('./auth-helper');
import Ensure = require('../../common/utils/ensure');

export interface IPasswordDocument {
    salt: string;
    hash: string;
}

export class Password implements IValueObject {
    private salt: string;
    private hash: string;

    constructor(salt: string, hash: string) {
        this.salt = Ensure.notNullOrEmpty(salt, 'Pass the salt');
        this.hash = Ensure.notNullOrEmpty(hash, 'Hash required');
    }

    static fromPassword(password: string): Password {
        password = Ensure.notNullOrEmpty(password, 'Password is required');

        var salt = AuthHelper.createSalt(),
            hash = AuthHelper.hashPassword(salt, password);

        return new Password(salt, hash);
    }

    checkPassword(password: string): void {
        if (!this.isMatchingPassword(password)) {
            throw new ValidationError('Invalid username or password');
        }
    }

    isMatchingPassword(existingPassword: string): boolean {
        var hashedPassword = AuthHelper.hashPassword(this.salt, existingPassword);

        return this.hash === hashedPassword;
    }

    toDocument(): Object {
        return {
            salt: this.salt,
            hash: this.hash
        };
    }
}