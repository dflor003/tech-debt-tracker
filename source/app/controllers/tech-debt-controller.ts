/// <reference path="../../../typings/libs.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import Ensure = require('../../common/utils/ensure');
import HttpStatusCode = require('../../common/web/http-status-code');
import Repository = require('../../common/persistence/repository');
import TechDebtItem = require('../debt/tech-debt-item');
import TechnicalImpediment = require('../debt/tech-impediment');
import JiraNumber = require('../debt/jira-number');
import ITechDebtDocument = require('../debt/i-tech-debt-document');
import User = require('../auth/user');
import Project = require('../projects/project');
import ProjectRepository = require('../projects/project-repository');
import UserRepository = require('../auth/user-repository');
import express = require('express');
import moment = require('moment');
import Enumerable = require('linq');

import Express = express.Express;
import Request = express.Request;
import Response = express.Response;
import IRouteHelper = routeHelper.IRouteHelper;
import IRouteParams = routeHelper.IRouteParams;
import IRouteCallback = routeHelper.IRouteCallback;
import IViewCallback = routeHelper.IViewCallback;

class TechDebtController extends BaseController {
    private techDeptRepository: Repository<TechDebtItem>;
    private projectRepository: ProjectRepository;
    private userRepository: UserRepository;

    constructor() {
        super('/api');
        this.techDeptRepository = new Repository<TechDebtItem>(TechDebtItem);
        this.projectRepository = new ProjectRepository();
        this.userRepository = new UserRepository();
    }

    initRoutes(router: IRouteHelper): void {
        router
            .get('/:project/techdebt', this.getTechDebtList)
            .get('/:project/techdebt/:id', this.getTechDebtDetail)
            .post('/:project/techdebt', this.addTechDebtItem);
    }

    getTechDebtList(params: IRouteParams, respond: IRouteCallback): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'No project code specified').toUpperCase(),
            page = params.int('page', 0),
            pageSize = params.int('per_page', 20);

        this.projectRepository.getProjectDevCost(projectCode)
            .then(cost => this.techDeptRepository
                .findAll({ projectCode: projectCode })
                .select({
                    include: ['name', 'description', 'updatedAt', 'impediments'],
                    select: (doc: ITechDebtDocument) => {
                        return {
                            id: doc._id.toHexString(),
                            name: doc.name,
                            description: doc.description,
                            updatedAt: moment(doc.updatedAt).toISOString(),
                            impedimentCount: doc.impediments.length,
                            cost: cost * Enumerable
                                .from(doc.impediments)
                                .select(impediment => moment.duration(impediment.amount).asHours())
                                .sum(),
                            slowdowns: Enumerable
                                .from(doc.impediments)
                                .select(impediment => impediment.amount.toString())
                                .toArray()
                        };
                    }
                })
                .skip(page)
                .take(pageSize)
                .orderByDescending('updatedAt')
                .execute()
                .then(items => respond(items)))
            .catch(err => respond(HttpStatusCode.BadRequest, { message: 'An error occurred', error: err.toString() }));
    }

    getTechDebtDetail(params: IRouteParams, respond: IRouteCallback): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'No project code specified').toUpperCase(),
            id = Ensure.notNullOrEmpty(params.string('id'), 'No tech debt id specified');

        this.techDeptRepository
            .findById(id)
            .then((result: TechDebtItem) => {
                var detail = result.toDetail(),
                    userIds = Enumerable
                        .from(detail.impediments)
                        .select(x => x.reportedById)
                        .toArray();

                return this.userRepository
                    .findUsersWithIds(userIds)
                    .then(users => {
                        var usersById = Enumerable
                            .from(users)
                            .toObject(user => user.getId(), user => user.toUserInfo());

                        detail.impediments.forEach(impediment => impediment.reporter = usersById[impediment.reportedById]);

                        respond(detail);
                    });
            })
            .catch(err => respond(err));
    }

    addTechDebtItem(params: IRouteParams, respond: IRouteCallback, req: Request): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'No project code specified').toUpperCase(),
            user: User = Ensure.notNull(req.user, 'Not logged in'),
            data: any = Ensure.notNull(params.body(), 'No data passed'),
            impediment = Ensure.notNull(data.impediment, 'No impediment details passed');

        var item = TechDebtItem.create({
            projectCode: projectCode,
            name: data.name,
            description: data.description,
            impediment: TechnicalImpediment.create({
                reportedBy: user.getId(),
                jira: new JiraNumber(data.impediment.jira),
                amount: moment.duration(data.impediment.amount),
                reason: data.impediment.reason
            })
        });
        this.techDeptRepository
            .create(item)
            .then(result => {
                respond(result);
            })
            .catch(err => respond(HttpStatusCode.BadRequest, { message: 'An error occurred', error: err.toString() }));
    }
}

export = TechDebtController;