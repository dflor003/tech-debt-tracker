/// <reference path="../../../typings/libs.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import Ensure = require('../../common/utils/ensure');
import HttpStatusCode = require('../../common/web/http-status-code');
import Repository = require('../../common/persistence/repository');
import TechDebtItem = require('../debt/tech-debt-item');
import techImpediment = require('../debt/tech-impediment');
import express = require('express');

import TechnicalImpediment = techImpediment.TechnicalImpediment;
import Express = express.Express;
import Request = express.Request;
import Response = express.Response;
import IRouteHelper = routeHelper.IRouteHelper;
import IRouteParams = routeHelper.IRouteParams;
import IRouteCallback = routeHelper.IRouteCallback;
import IViewCallback = routeHelper.IViewCallback;

class TechDebtController extends BaseController {
    private repository: Repository<TechDebtItem>;

    constructor() {
        super('/api')
        this.repository = new Repository<TechDebtItem>(TechDebtItem);
    }

    initRoutes(router: IRouteHelper): void {
        router
            .get('/:product/techdebt', this.getTechDebtList);
    }

    getTechDebtList(params: IRouteParams, respond: IRouteCallback): void {
        var product = Ensure.notNullOrEmpty(params.string('product'), 'No product code specified').toUpperCase(),
            page = params.int('page', 0),
            pageSize = params.int('per_page', 20);

        this.repository
            .findAll({ productCode: product })
            //.select('name', 'description')
            .skip(page)
            .take(pageSize)
            .orderBy('name')
            .execute()
            .then(items => respond(items))
            .fail(err => respond(HttpStatusCode.BadRequest, { message: 'An error occurred', error: err.toString() }));
    }
}

export = TechDebtController;