import * as util from 'util';

export interface ILogger {
    trace(message: any, ...args: any[]): void;
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

const inspect = (obj: any) => util.inspect(obj, <any>{
    depth: 4,
    colors: true,
    maxArrayLength: 10
});

function log(target: Function,
             level: string,
             namespace: string,
             message: any,
             ...args: any[]): void {

    const ts = new Date().toISOString();
    const finalMsg = `[${ts}] [${level}] [${namespace}] ${inspect(message)}`;

    target.apply(console, [finalMsg, ...args.map(inspect)]);
}

export default function logger(namespace?: string): ILogger {
    namespace = namespace || 'DEFAULT';

    return {
        trace(message: any, ...args: any[]): void {
            log(console.log, 'TRACE', namespace, message, ...args);
        },
        debug(message: any, ...args: any[]): void {
            log(console.log, 'DEBUG', namespace, message, ...args);
        },
        info(message: any, ...args: any[]): void {
            log(console.log, 'INFO ', namespace, message, ...args);
        },
        warn(message: any, ...args: any[]): void {
            log(console.error, 'WARN ', namespace, message, ...args);
        },
        error(message: any, ...args: any[]): void {
            log(console.error, 'ERROR', namespace, message, ...args);
        },
        fatal(message: any, ...args: any[]): void {
            log(console.error, 'FATAL', namespace, message, ...args);
        }
    };
}