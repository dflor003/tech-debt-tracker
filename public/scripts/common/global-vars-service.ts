/// <reference path="../auth/identity-service.ts" />

module tetra.common {
    import ILoggedInUserData = tetra.auth.ILoggedInUserData;

    export interface IGlobalVars {
        loggedInUser: ILoggedInUserData;
    }

    export class GlobalVarsService {
        private _loggedInUser: ILoggedInUserData;

        constructor($window: ng.IWindowService) {
            var globalVars: IGlobalVars = $window['globalVars'] || {};

            this._loggedInUser = globalVars.loggedInUser || null;
        }

        get user() {
            return this._loggedInUser;
        }
    }

    angular.module('app').service('globalVars', ($window: ng.IWindowService) => {
        return new GlobalVarsService($window);
    });
}