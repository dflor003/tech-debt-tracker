/// <reference path="../../../typings/libs.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import Ensure = require('../../common/utils/ensure');
import HttpStatusCode = require('../../common/web/http-status-code');
import Repository = require('../../common/persistence/repository');
import TechDebtItem = require('../debt/tech-debt-item');
import TechnicalImpediment = require('../debt/tech-impediment');
import ITechDebtDocument = require('../debt/i-tech-debt-document');
import Project = require('../projects/project');
import ProjectRepository = require('../projects/project-repository');
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

    constructor() {
        super('/api');
        this.techDeptRepository = new Repository<TechDebtItem>(TechDebtItem);
        this.projectRepository = new ProjectRepository();
    }

    initRoutes(router: IRouteHelper): void {
        router
            .get('/:project/techdebt', this.getTechDebtList);
    }

    getTechDebtList(params: IRouteParams, respond: IRouteCallback): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'No project code specified').toUpperCase(),
            page = params.int('page', 0),
            pageSize = params.int('per_page', 20);

        this.projectRepository.getProjectDevCost(projectCode)
            .then(cost => this.techDeptRepository
                .findAll({ productCode: projectCode })
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
}

export = TechDebtController;