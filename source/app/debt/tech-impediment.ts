import mongodb = require('mongodb');
import Enumerable = require('linq');
import moment = require('moment');
import Ensure = require('../../common/utils/ensure');
import errors = require('../../common/utils/errors');
import IValueObject = require('../../common/persistence/value-object');
import JiraNumber = require('./jira-number');
import Moment = moment.Moment;
import Duration = moment.Duration;
import ObjectId = mongodb.ObjectID;

export class SlowdownAmount {
    private static workDayHours = 8;

    static small(): Duration {
        return moment.duration(SlowdownAmount.workDayHours / 2, 'hours');
    }

    static medium(): Duration {
        return moment.duration(SlowdownAmount.workDayHours, 'hours');
    }

    static large(): Duration {
        return moment.duration(SlowdownAmount.workDayHours * 2, 'hours');
    }

    static extraLarge(): Duration {
        return moment.duration(SlowdownAmount.workDayHours * 5, 'hours');
    }
}

export interface ITechnicalImpedimentCreationInfo {
    reportedBy: string;
    jira: JiraNumber;
    amount: Duration;
    reason: string;
    createdAt?: Moment;
}

export interface ITechnicalImpedimentDocument {
    amount: number;
    jira: string;
    reason: string;
    reportedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export class TechnicalImpediment implements IValueObject {
    private amount: Duration;
    private jira: JiraNumber;
    private reason: string;
    private createdAt: Moment;
    private updatedAt: Moment;
    private reportedBy: string;

    constructor(reportedBy: string, jira: JiraNumber, amount: Duration, reason: string, createdAt?: Moment) {
        this.reportedBy = Ensure.notNullOrEmpty(reportedBy, 'Technical impediment must be reported by a user.');
        this.jira = Ensure.notNull(jira, 'Jira is required');
        this.amount = Ensure.notNull(amount, 'Amount is required');
        this.reason = Ensure.notNullOrEmpty(reason, 'Reason is required');
        this.createdAt = createdAt || moment();
        this.updatedAt = this.createdAt;
    }

    static create(data: ITechnicalImpedimentCreationInfo): TechnicalImpediment {
        var impediment = new TechnicalImpediment(data.reportedBy, data.jira, data.amount, data.reason, data.createdAt);
        return impediment;
    }

    static fromDocument(document: ITechnicalImpedimentDocument): TechnicalImpediment {
        var reporterId = document.reportedBy.toHexString(),
            amount = moment.duration(document.amount, 'hours'),
            jira = JiraNumber.fromDocument(document.jira),
            impediment = new TechnicalImpediment(reporterId, jira, amount, document.reason);

        return impediment;
    }

    getReporterId(): string {
        return this.reportedBy;
    }

    getCreatedAt(): Moment {
        return this.createdAt;
    }

    toDocument(): Object {
        return <ITechnicalImpedimentDocument>{
            amount: this.amount.asHours(),
            jira: this.jira.toDocument(),
            reason: this.reason,
            reportedBy: ObjectId.createFromHexString(this.reportedBy),
            createdAt: new Date(this.createdAt.toISOString()),
            updatedAt: new Date(this.updatedAt.toISOString())
        };
    }
}