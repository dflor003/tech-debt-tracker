
class Utils {
    static stringFormat(messageFormat: string, ...args: any[]): string {
        args = arguments.length === 2 && arguments[1] instanceof Array
            ? arguments[1]
            : args;

        args.forEach((arg, index) => messageFormat = messageFormat.replace(`{${index}}`, arg));
        return messageFormat;
    }

    static isNullOrUndefined(obj: any): boolean {
        return obj == null || typeof obj === 'undefined';
    }
}

export = Utils;