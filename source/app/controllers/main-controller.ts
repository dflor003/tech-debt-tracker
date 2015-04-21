/// <reference path="../../../typings/tsd.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import HttpStatusCode = require('../../common/web/http-status-code');
import Repository = require('../../common/persistence/repository');
import User = require('../auth/user');
import express = require('express');
import passport = require('passport');
import passportLocal = require('passport-local');

import Express = express.Express;
import Request = express.Request;
import Response = express.Response;
import LocalStrategy = passportLocal.Strategy;
import IRouteHelper = routeHelper.IRouteHelper;
import IRouteParams = routeHelper.IRouteParams;
import IRouteCallback = routeHelper.IRouteCallback;
import IViewCallback = routeHelper.IViewCallback;

class MainController extends BaseController {
    private userRepo: Repository<User>;

    constructor(userRepository?: Repository<User>) {
        super();
        this.userRepo = userRepository || new Repository<User>('Users', User);
    }

    initMiddleware() {
        passport.use(new LocalStrategy((username, password, done) => this.authenticate(username, password, done)));
        passport.serializeUser((user, done) => this.serializeUser(user, done));
        passport.deserializeUser((id, done) => this.deserializeUser(id, done));
    }

    initRoutes(router: IRouteHelper): void {
        router
            .page('/', this.home)
            .post('/api/login', this.login)
            .post('/api/logout', this.logout);
    }

    home(params: IRouteParams, respond: IViewCallback, req: Request): void {
        console.log(req.user);
        respond('layout', {
            currentUser: req.user
        });
    }

    login(params: IRouteParams, respond: IRouteCallback, req: Request, res: Response, next: Function): void {
        var auth = passport.authenticate('local', (err, user: User) => {
            if (err) return next(err);

            if (!user) {
                respond(HttpStatusCode.Unauthorized, { message: 'Invalid username or password. Please try again.' })
            }
            else {
                req.login(user, err  => {
                    if (err) return next(err);
                    console.log(user);
                    respond(user.toLoggedInUser());
                });
            }
        });

        auth(req, res, next);
    }

    logout(params: IRouteParams, respond: IRouteCallback, req: Request, res: Response, next: Function): void {
        req.logout();
        respond({ message: 'You have been successfully logged out!' });
    }

    authenticate(username, password, done: (err: any, result: any, message?: any) => void): void {
        var user = this.userRepo
            .findOne({ username: new RegExp(username, 'i') })
            .then((user: User) => {
                if (!user) {
                    done(null, false, { message: 'Invalid username or password. Please try again.' });
                }
                else if (!user.isMatchingPassword(password)) {
                    done(null, false, { message: 'Invalid username or password. Please try again.' });
                }
                else {
                    done(null, user);
                }
            })
            .fail(err => done(err, null));
    }

    serializeUser(user: User, done: (err: any, result: any) => void): void {
        if (user) {
            done(null, user.getId());
        }
    }

    deserializeUser(id: string, done: (err: any, result: any) => void): void {
        this.userRepo
            .findById(id)
            .then(user => {
                if (!user) {
                    done(null, null);
                }
                else {
                    done(null, user);
                }
            })
            .catch(err => done(err, null));
    }
}

export = MainController;