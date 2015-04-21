import Ensure = require('../../common/utils/ensure');
import errors = require('../../common/utils/errors');
import IValueObject = require('../../common/persistence/value-object');
import ValidationError = errors.ValidationError;

class JiraNumber implements IValueObject {
    private static JiraRegex = /[A-Z]+[-][0-9]+/;
    private jiraId: string;

    constructor(jiraId: string) {
        this.jiraId = Ensure.notNullOrEmpty(jiraId, 'Jira ID is required').toUpperCase();
        if (!JiraNumber.JiraRegex.test(this.jiraId)) {
            throw new ValidationError('Jira ID must be of the format PROJECTCODE-#####');
        }
    }

    static fromDocument(document: string): JiraNumber {
        return new JiraNumber(document);
    }

    equals(other: JiraNumber): boolean {
        return this.jiraId === other.jiraId;
    }

    toString() {
        return this.jiraId;
    }

    toDocument(): Object {
        return this.jiraId;
    }
}

export = JiraNumber;