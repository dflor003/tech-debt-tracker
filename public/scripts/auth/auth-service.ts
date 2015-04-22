/// <reference path="../libs.d.ts" />
/// <reference path="session-service.ts" />

module tetra.auth {

    export class AuthService {
        private $http: ng.IHttpService;
        private $q: ng.IQService;

        constructor($http: ng.IHttpService, $q: ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }

        login(username: string, password: string): ng.IHttpPromise<ILoggedInUserData> {
            return this.$http
                .post<ILoggedInUserData>('/api/login', {
                    username: username,
                    password: password
                });
        }

        logout(): ng.IHttpPromise<any> {
            return this.$http.post('/api/logout', {});
        }
    }

    angular.module('app').factory('authService', ($http: ng.IHttpService, $q: ng.IQService) => {
        return new AuthService($http, $q);
    });
}