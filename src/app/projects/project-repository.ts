/// <reference path="../../../typings/libs.d.ts" />

import Q = require('q');
import Repository = require('../../common/persistence/repository');
import Project = require('./project');
import Promise = Q.Promise;

class ProjectRepository extends Repository<Project> {
    constructor() {
        super(Project);
    }

    getProjectDevCost(projectCode: string): Promise<number> {
        var dfd = Q.defer<number>();

        this.findById(projectCode)
            .then(project => {
                console.log(project.toSummary());
                dfd.resolve(project.getHourlyCost());
            })
            .fail(dfd.reject);

        return dfd.promise;
    }
}

export = ProjectRepository;