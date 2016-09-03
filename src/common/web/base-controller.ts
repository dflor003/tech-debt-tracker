/// <reference path="../../../typings/libs.d.ts" />

import express = require('express');
import helper = require('./route-helper');
import IRouteHelper = helper.IRouteHelper;
import RouteHelper = helper.RouteHelper;
import Express = express.Express;
import Router = express.Router;

class BaseController {
    baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = typeof baseUrl === 'string' ? baseUrl : null;
    }

    init(rootDir: string, app: Express): void {
        // Setup router and helper
        var router = express.Router(),
            routeHelper = new RouteHelper(router, this);

        // Init
        this.initMiddleware(app);
        this.initRoutes(routeHelper);

        // Inject router into app
        rootDir = rootDir || '/';
        var baseUrl = !this.baseUrl ? rootDir : rootDir + this.baseUrl
        app.use(baseUrl, router);
    }

    initMiddleware(app: Express): void {
    }

    initRoutes(router: IRouteHelper): void {
        throw new Error('Abstract method not implemented');
    }
}

export = BaseController;