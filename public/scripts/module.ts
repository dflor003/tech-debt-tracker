/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
/// <reference path="auth/security-helper.ts" />

module tetra {
    import IRouteProvider = angular.route.IRouteProvider;
    import ILocationProvider = angular.ILocationProvider;
    import SecurityHelper = tetra.auth.SecurityHelper;

    var app = angular.module('app', ['ngRoute', 'ui.bootstrap']);

    app
        .config(($routeProvider: IRouteProvider) => {
            $routeProvider
                .when('/dashboard/:product', {
                    templateUrl: '/scripts/dashboard/dashboard.html',
                    controller: 'dashboardCtrl',
                    controllerAs: 'ctrl',
                    resolve: SecurityHelper.requiresLogin()
                })
                .when('/techdebt/:project', {
                    templateUrl: '/scripts/tech-debt/tech-debt-list.html',
                    controller: 'techDebtListCtrl',
                    controllerAs: 'ctrl',
                    resolve: SecurityHelper.requiresLogin()
                })
                .when('/techdebt/:project/new', {
                    templateUrl: '/scripts/tech-debt/create-tech-debt.html',
                    controller: 'createTechDebtCtrl',
                    controllerAs: 'ctrl',
                    resolve: SecurityHelper.requiresLogin()
                })
                .when('/login', {
                    templateUrl: '/scripts/auth/login.html',
                    controller: 'loginCtrl',
                    controllerAs: 'ctrl'
                })
                .otherwise({ redirectTo: '/dashboard/omg' })
        })
        .run(($rootScope: ng.IRootScopeService, $location: ng.ILocationService) => {
            $rootScope.$on('$routeChangeError', (evt, current, prev, rejection) => {
                if (rejection === SecurityHelper.NotAuthorized) {
                    $location.path('/login');
                }
            });
        });
}