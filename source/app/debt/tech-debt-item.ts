/// <reference path="../../../typings/libs.d.ts" />

import mongodb = require('mongodb');
import Enumerable = require('linq');
import moment = require('moment');
import Ensure = require('../../common/utils/ensure');
import errors = require('../../common/utils/errors');
import IEntity = require('../../common/persistence/entity');
import JiraNumber = require('./jira-number');
import TechnicalImpediment = require('./tech-impediment');
import ITechDebtDocument = require('./i-tech-debt-document');
import ITechnicalImpedimentDocument = require('./i-tech-impediment-document');
import IImpedimentDetail = require('./i-impediment-detail');
import ValidationError = errors.ValidationError;
import ObjectId = mongodb.ObjectID;
import Moment = moment.Moment;

interface ITechDebtCreationData {
    projectCode: string;
    name: string;
    description: string;
    impediment: TechnicalImpediment;
    createdAt?: Moment;
}

interface ITechDebtItemDetail {
    projectCode: string;
    name: string;
    description: string;
    impediments: IImpedimentDetail[];
    devHourCost: number;
    createdAt: string;
}

class TechDebtItem implements IEntity {
    private id: string;
    private createdAt: Moment;
    private updateAt: Moment;
    private reportedBy: string;
    private name: string;
    private description: string;
    private projectCode: string;
    private associatedJiras: JiraNumber[] = [];
    private impediments: TechnicalImpediment[] = [];

    constructor(projectCode: string, name: string, description: string, reportedBy: string, createdAt?: Moment) {
        this.projectCode = Ensure.notNullOrEmpty(projectCode, 'Tech debt item must have a project code').toUpperCase();
        this.name = Ensure.notNullOrEmpty(name, 'Tech debt item name is required');
        this.description = Ensure.notNullOrEmpty(description, 'Tech debt item description is required');
        this.createdAt = createdAt || moment();
        this.updateAt = this.createdAt;
        this.reportedBy = reportedBy;
    }

    static create(data: ITechDebtCreationData): TechDebtItem {
        if (!data.impediment) {
            throw new ValidationError('New tech debt items must be associated with at least one technical impediment');
        }

        var reporter = data.impediment.getReporterId(),
            item = new TechDebtItem(data.projectCode, data.name, data.description, reporter, data.createdAt);

        item.impediments.push(data.impediment);

        return item;
    }

    static fromDocument(document: ITechDebtDocument): TechDebtItem {
        var id = document._id.toHexString(),
            createdAt = moment(document.createdAt),
            updatedAt = moment(document.updatedAt),
            item = new TechDebtItem(document.projectCode, document.name, document.description, document.reportedBy.toHexString());

        item.id = id;
        item.createdAt = createdAt;
        item.updateAt = updatedAt;
        item.associatedJiras = document.associatedJiras.map(jira => JiraNumber.fromDocument(jira));
        item.impediments = document.impediments.map(impediment => TechnicalImpediment.fromDocument(impediment));

        return item;
    }

    static transformId(id: string): ObjectId {
        return !id ? null : ObjectId.createFromHexString(id);
    }

    addImpediment(impediment: TechnicalImpediment): void {
        Ensure.notNull(impediment, 'Impediment required');
        this.impediments.push(impediment);
        this.updateAt = impediment.getCreatedAt();
    }

    addJira(jira: JiraNumber): void {
        if (Enumerable.from(this.associatedJiras).any((jiraNum: JiraNumber) => jiraNum.equals(jira))) {
            throw new ValidationError(`Jira '${jira}' has already been added to tech debt item '${this.name}'`)
        }

        this.associatedJiras.push(jira);
    }

    getId(): string {
        return this.id;
    }

    toDetail(): ITechDebtItemDetail {
        return {
            projectCode: this.projectCode,
            name: this.name,
            description: this.description,
            impediments: this.impediments.map(x => x.toDetail()),
            devHourCost: 0.0,
            createdAt: this.createdAt.toISOString()
        };
    }

    toDocument(): Object {
        return <ITechDebtDocument>{
            _id: TechDebtItem.transformId(this.id),
            createdAt: new Date(this.createdAt.toISOString()),
            updatedAt: new Date(this.updateAt.toISOString()),
            projectCode: this.projectCode,
            reportedBy: ObjectId.createFromHexString(this.reportedBy),
            name: this.name,
            description: this.description,
            impediments: this.impediments.map(impediment => impediment.toDocument()),
            associatedJiras: this.associatedJiras.map(jira => jira.toDocument())
        };
    }
}

export = TechDebtItem;