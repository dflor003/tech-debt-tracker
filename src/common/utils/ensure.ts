/// <reference path="../../../typings/libs.d.ts" />

import Utils = require('./utils');
import errors = require('../../utils/errors/errors');
import ValidationError = errors.ValidationError;

class Ensure {
    static notNullOrEmpty(str: string, message: string, ...fmtArgs: any[]): string {
        str = Ensure.notNull.apply(null, [str, message].concat(fmtArgs));
        if (typeof str !== 'string') {
            throw new ValidationError(`Expected string but got ${typeof str}. \nValue: \n${JSON.stringify(str, null, 4)}`);
        }

        if(!str.trim()) {
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