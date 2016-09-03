import HttpError from './http-error';
import HttpStatusCode from '../http-status-code';

export default class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, HttpStatusCode.NotFound);
    }
}