/// <reference path="../../../typings/tsd.d.ts" />

import express = require('express');
import helper = require('./route-helper');
import IRouteHelper = helper.IRouteHelper;
import RouteHelper = helper.RouteHelper;
import Express = express.Express;
import Router = express.Router;

class BaseController {
    baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = typeof baseUrl === 'string' ? baseUrl : '/';
    }

    init(app: Express): void {
        // Setup router and helper
        var router = express.Router(),
            routeHelper = new RouteHelper(router, this);

        // Init
        this.initMiddleware(app);
        this.initRoutes(routeHelper);

        // Inject router into app
        app.use(this.baseUrl, router);
    }

    initMiddleware(app: Express): void {
    }

    initRoutes(router: IRouteHelper): void {
        throw new Error('Abstract method not implemented');
    }
}

export = BaseController;