/// <reference path="../../../typings/libs.d.ts" />

import Ensure = require('../../common/utils/ensure');
import Utils = require('../../common/utils/utils');
import errors = require('../../utils/errors/errors');
import IEntity = require('../../common/persistence/entity');
import mongodb = require('mongodb');
import IProjectDocument = require('./i-project-document');
import ObjectId = mongodb.ObjectID;
import ValidationError = errors.ValidationError;

interface IProjectCreationData {
    code: string;
    name: string;
    description: string;
    devHourlyCost?: number;
    techDebtBudget?: number;
}

class Project implements IEntity {
    private code: string;
    private name: string;
    private description: string;
    private costPerDeveloperHour: number = 0.0;
    private techDebtBudget: number = 0.0;

    constructor(code: string, name: string, description: string, devCost?: number) {
        this.code = Ensure.notNullOrEmpty(code, 'Project code is required').toUpperCase();
        this.name = Ensure.notNullOrEmpty(name, 'Project name is required');
        this.description = Ensure.notNullOrEmpty(description, 'Description is required');
        this.costPerDeveloperHour = Utils.coalesce(devCost, 1);
    }

    static create(data: IProjectCreationData): Project {
        var project = new Project(data.code, data.name, data.description, data.devHourlyCost);

        if (typeof data.techDebtBudget === 'number') {
            project.setTechDebtBudget(data.techDebtBudget);
        }

        return project;
    }

    static fromDocument(doc: IProjectDocument): Project {
        var project = new Project(doc._id, doc.name, doc.description, doc.costPerDeveloperHour);
        project.techDebtBudget = doc.techDebtBudget;

        return project;
    }

    getProjectCode(): string {
        return this.code;
    }

    getHourlyCost(): number {
        return this.costPerDeveloperHour;
    }

    getTechDebtBudget(): number {
        return this.techDebtBudget;
    }

    getId(): string {
        return this.code;
    }

    setTechDebtBudget(newBudget: number): void {
        this.techDebtBudget = newBudget;
    }

    toSummary(): any {
        return {
            code: this.code,
            name: this.name,
            description: this.description,
        };
    }

    toDocument(): Object {
        return {
            _id: this.code.toUpperCase(),
            name: this.name,
            description: this.description,
            costPerDeveloperHour: this.costPerDeveloperHour,
            techDebtBudget: this.techDebtBudget
        };
    }
}

export = Project;