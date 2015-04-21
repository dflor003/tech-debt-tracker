import HttpStatusCode = require('../web/http-status-code');

export class AppError implements Error {
    private __stack: string;

    message: string;
    status: number;

    constructor(message: string, status: number = 500) {
        this.message = message;
        this.status = status;

        // Generate actual exception and get stack
        var error: any = new Error(message);
        this.__stack = error.stack;
    }

    get name(): string {
        return this.constructor['name'];
    }

    get stack(): string {

        return this.toString() + '\n' + this.__stack;
    }

    toString(): string {
        return this.name + ': ' + this.message;
    }
}

export class HttpError extends AppError {

    constructor(message: string, statusCode: HttpStatusCode) {
        super(message, statusCode);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = "Not found") {
        super(message, HttpStatusCode.NotFound);
    }
}

export class ValidationError extends HttpError {
    constructor(message: string) {
        super(message, HttpStatusCode.BadRequest);
    }
}