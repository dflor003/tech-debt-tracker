/// <reference path="../../../typings/libs.d.ts" />

import crypto = require('crypto');

class AuthHelper {
    static createSalt(): string {
        return crypto.randomBytes(128).toString('base64');
    }

    static hashPassword(salt: string, password: string): string {
        var hmac = crypto.createHmac('sha1', salt);
        return hmac.update(password).digest('hex');
    }
}

export = AuthHelper;