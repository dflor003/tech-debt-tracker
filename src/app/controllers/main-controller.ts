/// <reference path="../../../typings/libs.d.ts" />

import BaseController = require('../../common/web/base-controller');
import routeHelper = require('../../common/web/route-helper');
import HttpStatusCode = require('../../utils/http-status-code');
import User = require('../auth/user');
import UserRepository = require('../auth/user-repository');
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
    private userRepo: UserRepository;

    constructor(userRepository?: UserRepository) {
        super();
        this.userRepo = userRepository || new UserRepository();
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
        var currentUser: User = req.user;

        respond('layout', {
            currentUser: !currentUser
                ? null
                : currentUser.toLoggedInUser()
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
        this.userRepo
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