import Q = require('q');
import Enumerable = require('linq');
import moment = require('moment');
import Repository = require('../common/persistence/repository');
import Project = require('../app/projects/project');
import TechnicalImpediment = require('../app/debt/tech-impediment');
import SlowdownAmount = require('../app/debt/slowdown-amount');
import User = require('../app/auth/user');
import Promise = Q.Promise;

function seed(): Promise<any> {
    var dfd = Q.defer<any>(),
        avgDevSalary = 45.36,
        debtBudget = 10000,
        projectRepository = new Repository<Project>(Project),
        projects: Project[] = [
            Project.create({
                code: 'omg',
                name: 'UltiPro Organization Modeling',
                description: 'Allows an organization to manage and model the structure of its organizational units.',
                devHourlyCost: avgDevSalary,
                techDebtBudget: debtBudget
            }),
            Project.create({
                code: 'onb',
                name: 'UltiPro Onboarding',
                description: 'Assists new employees with their onboarding experience after hired into an organization.',
                devHourlyCost: avgDevSalary,
                techDebtBudget: debtBudget
            }),
            Project.create({
                code: 'rec',
                name: 'UltiPro Recruiting',
                description: 'Hosts job listings, facilitates job application process, and allows recruiters to manage their recruiting process.',
                devHourlyCost: avgDevSalary,
                techDebtBudget: debtBudget
            }),
            Project.create({
                code: 'hel',
                name: 'Some healthy project',
                description: 'This is a sample project that\'s relatively healthy.',
                devHourlyCost: avgDevSalary,
                techDebtBudget: 6000
            }),
            Project.create({
                code: 'ovr',
                name: 'Over budget project',
                description: 'This project is over budget',
                devHourlyCost: avgDevSalary,
                techDebtBudget: 3000
            })
        ];

    projectRepository
        .createAll(projects)
        .then(() => {
            var projectCodes = Enumerable.from(projects).select(x => x.getProjectCode()).toArray();
            console.log(`Created projects: [ ${projectCodes.join(', ')} ]`)
            dfd.resolve(projects);
        })
        .fail(err => {
            console.error(`Error creating projects: ${err}`);
            dfd.reject(err);
        });

    return dfd.promise;
}

export = seed;