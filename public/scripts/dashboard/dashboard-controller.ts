/// <reference path="../libs.d.ts" />
/// <reference path="../services/project-service.ts" />
/// <reference path="dashboard-model.ts" />

module tetra.dashboard {
    import EventBus = tetra.common.EventBus;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;
    import MessageLog = tetra.common.MessageLog;

    export class DashboardController {
        private $http: ng.IHttpService;
        private $location: ng.ILocationService;
        private log = new MessageLog();

        model: DashboardSummary;

        constructor($routeParams: ng.route.IRouteParamsService, $http: ng.IHttpService, $location: ng.ILocationService, eventBus: EventBus) {
            this.$http = $http;
            this.$location = $location;

            var projectCode = $routeParams['project'];
            this.loadDashboard(projectCode);

            eventBus.on('project-changed', newProject => this.$location.path(`/dashboard/${newProject.code}`));
        }

        loadDashboard(projectCode: string): void {
            this.$http.get<IDashboardData>(`/api/analytics/${projectCode}`)
                .success(result => this.model = new DashboardSummary(result))
                .error(err => this.log.addErrorResponse(err));
        }

        goToItem(id: string): void {
            this.$location.path(`/techdebt/${this.model.project.code}/${id}`);
        }
    }

    angular.module('app').controller('dashboardCtrl', DashboardController);
}