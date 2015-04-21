/// <reference path="../../../typings/libs.d.ts" />

import express = require('express');
import HttpStatusCode = require('./http-status-code')
import HttpMethod = require('./http-method')

module routeHelper {
    import Router = express.Router;
    import Request = express.Request;
    import Response = express.Response;
    import IRouterMatcher = express.IRouterMatcher;

    type RouteDefinition = string|RegExp;

    export interface IRouteParams {
        body<TObject>(): TObject;
        string(key: string, defaultValue?: string): string;
        int(key: string, defaultValue?: number): number;
        float(key: string, defaultValue?: number): number;
    }

    export interface IRouteCallback {
        (status: HttpStatusCode, body: any): void;
        (body: any): void;
    }

    export interface IViewCallback {
        (status: HttpStatusCode, view: string, model: any): void;
        (view: string, model: any): void;
    }

    export interface IRouteHandler {
        (params: IRouteParams, response: IRouteCallback, req?: Request, res?: Response, next?: Function): void;
    }

    export interface IViewHandler {
        (params: IRouteParams, response: IViewCallback, req?: Request, res?: Response, next?: Function): void;
    }

    export interface IRouteHelper {
        page(url: RouteDefinition, handler: IViewHandler): IRouteHelper
        get(url: RouteDefinition, handler: IRouteHandler): IRouteHelper;
        put(url: RouteDefinition, handler: IRouteHandler): IRouteHelper;
        patch(url: RouteDefinition, handler: IRouteHandler): IRouteHelper;
        post(url: RouteDefinition, handler: IRouteHandler): IRouteHelper;
        delete(url: RouteDefinition, handler: IRouteHandler): IRouteHelper;
    }

    interface IParamMap {
        [key: string]: string;
    }

    export class RouteParams implements IRouteParams {
        private params: IParamMap;
        private query: IParamMap;
        private bodyObj: any;

        constructor(params: IParamMap, query: IParamMap, body: any) {
            this.params = params;
            this.query = query;
            this.bodyObj = body;
        }

        body<TObject>(): TObject {
            return this.bodyObj;
        }

        string(key: string, defaultValue?: string): string {
            var value = this.getValue(key);
            return typeof value === 'undefined' ? defaultValue : value;
        }

        int(key: string, defaultValue?: number): number {
            var value = this.getValue(key);
            if (typeof value === 'undefined') {
                return defaultValue;
            }

            var intValue = parseInt(value, 10);
            return isNaN(intValue) ? defaultValue : intValue;
        }

        float(key: string, defaultValue?: number): number {
            var value = this.getValue(key);
            if (typeof value === 'undefined') {
                return defaultValue;
            }

            var intValue = parseFloat(value);
            return isNaN(intValue) ? defaultValue : intValue;
        }

        private getValue(key: string): string {
            var values = [this.params[key], this.query[key]];
            for(var i = 0; i < values.length; i++) {
                var current = values[i];
                if (typeof current !== 'undefined') {
                    return current.trim();
                }
            }

            return undefined;
        }
    }

    export class RouteHelper implements IRouteHelper {
        private router: Router;
        private scope: Object;

        constructor(router: Router, scope: Object) {
            this.router = router;
            this.scope = scope;
        }

        page(url: RouteDefinition, handler: IViewHandler): IRouteHelper {

            this.router.get(<any>url, (req: Request, res: Response, next: Function) => {
                var responseCallback = () => {
                    // Coalesce args
                    var status = arguments.length === 3 ? arguments[0] : HttpStatusCode.OK,
                        view = arguments.length === 3 ? arguments[1] : arguments[0],
                        model = arguments.length === 3 ? arguments[2] : arguments[1];

                    // Respond
                    res.status(status).render(view, model);
                };

                var routeParams = new RouteParams(req.params, req.query, req.body);
                handler.apply(this.scope, [routeParams, responseCallback, req, res, next]);
            });

            return this;
        }

        get(url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            return this.route(HttpMethod.GET, url, handler);
        }

        put(url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            return this.route(HttpMethod.PUT, url, handler);
        }

        patch(url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            return this.route(HttpMethod.PATCH, url, handler);
        }

        post(url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            return this.route(HttpMethod.POST, url, handler);
        }

        delete(url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            return this.route(HttpMethod.DELETE, url, handler);
        }

        private route(method: HttpMethod, url: RouteDefinition, handler: IRouteHandler): IRouteHelper {
            var routerMethod = HttpMethod[method].toLowerCase();

            this.router[routerMethod](<any>url, (req: Request, res: Response, next: Function) => {
                var responseCallback = () => {
                    // Coalesce args
                    var status = arguments.length === 2 ? arguments[0] : HttpStatusCode.OK,
                        body = arguments.length === 2 ? arguments[1] : arguments[0];

                    // Respond
                    res.status(status).send(body);
                };

                var routeParams = new RouteParams(req.params, req.query, req.body);
                handler.apply(this.scope, [routeParams, responseCallback, req, res, next]);
            });

            return this;
        }
    }
}

export = routeHelper;