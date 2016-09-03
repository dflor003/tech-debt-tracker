/// <reference path="../../../typings/libs.d.ts" />

import Q = require('q');
import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import Ensure = require('../../common/utils/ensure');
import HttpStatusCode = require('../../utils/http-status-code');
import ProjectRepository = require('../projects/project-repository');
import TechDebtRepository = require('../debt/tech-debt-repository');
import Project = require('../projects/project');
import TechDebtItem = require('../debt/tech-debt-item');
import express = require('express');
import Enumerable = require('linq');

import Express = express.Express;
import Request = express.Request;
import Response = express.Response;
import IRouteHelper = routeHelper.IRouteHelper;
import IRouteParams = routeHelper.IRouteParams;
import IRouteCallback = routeHelper.IRouteCallback;
import IViewCallback = routeHelper.IViewCallback;

class DashboardController extends BaseController {
    private projectRepository: ProjectRepository;
    private techDebtRepository: TechDebtRepository;

    constructor() {
        super('/api/analytics');
        this.projectRepository = new ProjectRepository();
        this.techDebtRepository = new TechDebtRepository();
    }

    initRoutes(router: IRouteHelper): void {
        router
            .get('/:project', this.getProjectAnalyticsSummary);
    }

    getProjectAnalyticsSummary(params: IRouteParams, respond: IRouteCallback): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'Project code required').toUpperCase();

        Q.spread<any,any>([
            this.projectRepository.findById(projectCode),
            this.techDebtRepository.findAll({ projectCode: projectCode }).execute()
        ], (project: Project, debt: TechDebtItem[]) => {
            var devCost = project.getHourlyCost(),
                totalCost = 0,
                totalTimeLost = 0,
                techDebtItems = Enumerable
                    .from(debt)
                    .select((item: TechDebtItem) => {
                        var timeLost = item.getTotalTimeLost(),
                            cost = devCost * timeLost.asHours();

                        totalTimeLost += timeLost.asHours();
                        totalCost += cost;
                        return {
                            id: item.getId(),
                            name: item.getName(),
                            createdAt: item.getCreatedAt().toISOString(),
                            reporterId: item.getReporterId(),
                            cost: cost,
                            timeLost: timeLost.toISOString()
                        };
                    })
                    .toArray();

            respond({
                project: project.toSummary(),
                budget: project.getTechDebtBudget(),
                costPerHour: devCost,
                totalCost: totalCost,
                totalTimeLost: totalTimeLost,
                techDebt: techDebtItems
            });
        })
        .catch(err => respond(err));
    }
}

export = DashboardController;