/// <reference path="../libs.d.ts" />

module tetra.common{
    export enum MessageType {
        Error = 0,
        Warning = 1,
        Success = 2,
        Info = 3
    }

    export class LogMessage {
        type: MessageType;
        message: string;

        constructor(type: MessageType, message: string) {
            this.type = type;
            this.message = message;
        }
    }

    export class MessageLog {
        messages: LogMessage[];

        constructor() {
            this.messages = [];
        }

        get errors(): LogMessage[] {
            return this.getMessagesByType(MessageType.Error);
        }

        get successes(): LogMessage[] {
            return this.getMessagesByType(MessageType.Success);
        }

        get hasErrors(): boolean {
            return this.errors.length > 0;
        }

        get hasSuccesses(): boolean {
            return this.successes.length > 0;
        }

        addSuccess(message: string): void {
            var logMessage = this.addMessage(MessageType.Success, message);
        }

        addErrorResponse(response: any): void {
            if (!response) {
                return;
            }
            if (response.errors) {
                response.errors.forEach((msg: string) => this.addError(msg));
            } else {
                this.addError(response.message);
            }
        }

        addError(message: string): void {
            this.addMessage(MessageType.Error, message);
        }

        addMessage(type: MessageType, message: string): LogMessage {
            var logMessage = new LogMessage(type, message);
            this.messages.push(logMessage);
            return logMessage;
        }

        clearAll(): void {
            this.messages = [];
        }

        private getMessagesByType(type: MessageType): LogMessage[] {
            return Enumerable.from(this.messages)
                .where((msg: LogMessage) => msg.type === type)
                .toArray();
        }
    }
}