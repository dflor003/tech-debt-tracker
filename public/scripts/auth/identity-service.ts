/// <reference path="../libs.d.ts" />
/// <reference path="../common/global-vars-service.ts" />
/// <reference path="auth-service.ts" />

module tetra.auth {
    import GlobalVarsService = tetra.common.GlobalVarsService;

    export interface ILoggedInUserData {
        id: string;
        firstName: string;
        lastName: string;
        products: string[];
        roles: string[];
    }

    export class LoggedInUser  {
        id: string;
        firstName: string;
        lastName: string;
        products: string[];
        roles: string[];

        constructor(data: ILoggedInUserData) {
            this.id = data.id;
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.products = data.products || [];
            this.roles = data.roles || [];
        }
    }

    export class IdentityService {
        private $q: ng.IQService;
        private user: LoggedInUser;
        private authService: AuthService;

        constructor($q: ng.IQService, globalVars: GlobalVarsService, authService: AuthService) {
            this.$q = $q;
            this.authService = authService;

            var user = globalVars.user;
            this.user = !!user ? new LoggedInUser(user) : null;
        }

        get currentUser(): LoggedInUser{
            return this.user;
        }

        get isLoggedIn(): boolean {
            return !!this.user;
        }

        loginUser(username: string, password: string): ng.IPromise<LoggedInUser> {
            var dfd = this.$q.defer<any>();

            if (!username || !password) {
                dfd.reject('Please enter a username and password.');
                return dfd.promise;
            }

            this.authService
                .login(username, password)
                .success((loggedInUser: ILoggedInUserData) => {
                    this.user = new LoggedInUser(loggedInUser);
                    dfd.resolve(this.user);
                })
                .error(err => {
                    this.user = null;
                    var message = err.message || 'An error occurred';
                    dfd.reject(message);
                });

            return dfd.promise;
        }

        logoutUser(): ng.IPromise<any> {
            var dfd = this.$q.defer<any>();
            if (!this.user) {
                dfd.reject('Not logged in!')
                return dfd.promise;
            }

            this.user = null;
            this.authService
                .logout()
                .success(dfd.resolve)
                .error(dfd.reject);

            return dfd.promise;
        }
    }

    angular
        .module('app')
        .service('identityService', ($q: ng.IQService, globalVars: GlobalVarsService, authService: AuthService) => {
            return new IdentityService($q, globalVars, authService);
        });
}