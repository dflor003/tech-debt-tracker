export interface ILogger {
    trace(message: any, ...args: any[]): void;
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

function log(target: Function,
             message: any,
             ...args: any[]): void {

    target.apply(console, [message, ...args]);
}

export default function logger(): ILogger {
    return {
        trace(message: any, ...args: any[]): void {
            log(console.log, message, ...args);
        },
        debug(message: any, ...args: any[]): void {
            log(console.log, message, ...args);
        },
        info(message: any, ...args: any[]): void {
            log(console.log, message, ...args);
        },
        warn(message: any, ...args: any[]): void {
            log(console.error, message, ...args);
        },
        error(message: any, ...args: any[]): void {
            log(console.error, message, ...args);
        },
        fatal(message: any, ...args: any[]): void {
            log(console.error, message, ...args);
        }
    };
}