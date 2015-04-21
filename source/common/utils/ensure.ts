/// <reference path="../../../typings/tsd.d.ts" />

import Utils = require('./utils');
import errors = require('./errors');
import ValidationError = errors.ValidationError;

class Ensure {
    static notNullOrEmpty(str: string, message: string, ...fmtArgs: any[]): string {
        if(Utils.isNullOrUndefined(str) || !str.trim()) {
            throw new ValidationError(Utils.stringFormat(message, fmtArgs));
        }

        return str.trim();
    }

    static notNull<TValue>(value: TValue, message: string, ...fmtArgs: any[]): TValue {
        if (Utils.isNullOrUndefined(value)) {
            throw new ValidationError(Utils.stringFormat(message, fmtArgs));
        }

        return value;
    }
}

export = Ensure;