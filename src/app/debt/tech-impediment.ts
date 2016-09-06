import mongodb = require('mongodb');
import Enumerable = require('linq');
import moment = require('moment');
import Ensure = require('../../common/utils/ensure');
import errors = require('../../utils/errors/errors');
import IValueObject = require('../../infrastructure/persistence/value-object');
import JiraNumber = require('./jira-number');
import ITechnicalImpedimentDocument = require('./i-tech-impediment-document');
import IImpedimentDetail = require('./i-impediment-detail');
import Moment = moment.Moment;
import Duration = moment.Duration;
import ObjectId = mongodb.ObjectID;

interface ITechnicalImpedimentCreationInfo {
    reportedBy: string;
    jira: JiraNumber;
    amount: Duration;
    reason: string;
    createdAt?: Moment;
}

class TechnicalImpediment implements IValueObject {
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
            amount = moment.duration(document.amount),
            jira = JiraNumber.fromDocument(document.jira),
            impediment = new TechnicalImpediment(reporterId, jira, amount, document.reason);

        impediment.createdAt = moment(document.createdAt);
        impediment.updatedAt = moment(document.updatedAt);

        return impediment;
    }

    getReporterId(): string {
        return this.reportedBy;
    }

    getCreatedAt(): Moment {
        return this.createdAt;
    }

    getTimeLost(): Duration {
        return this.amount;
    }

    toDetail(): IImpedimentDetail {
        return {
            reportedById: this.reportedBy,
            reporter: null,
            jira: this.jira.toString(),
            amount: this.amount.toISOString(),
            reason: this.reason,
            createdAt: this.createdAt.toISOString()
        };
    }

    toDocument(): Object {
        return <ITechnicalImpedimentDocument>{
            amount: this.amount.toString(),
            jira: this.jira.toDocument(),
            reason: this.reason,
            reportedBy: ObjectId.createFromHexString(this.reportedBy),
            createdAt: new Date(this.createdAt.toISOString()),
            updatedAt: new Date(this.updatedAt.toISOString())
        };
    }
}

export = TechnicalImpediment;