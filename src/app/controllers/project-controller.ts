/// <reference path="../../../typings/libs.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import Ensure = require('../../common/utils/ensure');
import HttpStatusCode = require('../../utils/http-status-code');
import ProjectRepository = require('../projects/project-repository');
import Project = require('../projects/project');
import express = require('express');
import Enumerable = require('linq');

import Express = express.Express;
import Request = express.Request;
import Response = express.Response;
import IRouteHelper = routeHelper.IRouteHelper;
import IRouteParams = routeHelper.IRouteParams;
import IRouteCallback = routeHelper.IRouteCallback;
import IViewCallback = routeHelper.IViewCallback;

class ProjectController extends BaseController {
    private projectRepository: ProjectRepository;

    constructor() {
        super('/api/projects');
        this.projectRepository = new ProjectRepository();
    }

    initRoutes(router: IRouteHelper): void {
        router
            .get('/:project', this.getProjectSummary);
    }

    getProjectSummary(params: IRouteParams, respond: IRouteCallback): void {
        var projectCode = Ensure.notNullOrEmpty(params.string('project'), 'Project code required').toUpperCase();

        this.projectRepository
            .findById(projectCode)
            .then(project => respond(project.toSummary()))
            .fail(err => respond(HttpStatusCode.BadRequest, {
                message: `An error occurred loading '${projectCode}'`,
                error: err.toString()
            }));
    }
}

export = ProjectController;