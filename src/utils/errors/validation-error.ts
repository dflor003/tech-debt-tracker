import HttpStatusCode from '../http-status-code';
import HttpError from './http-error';

export class ValidationError extends HttpError {
    constructor(message: string) {
        super(message, HttpStatusCode.BadRequest);
    }
}