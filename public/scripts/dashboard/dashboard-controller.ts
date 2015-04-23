/// <reference path="../libs.d.ts" />
/// <reference path="../services/project-service.ts" />
/// <reference path="dashboard-model.ts" />

module tetra.dashboard {
    import EventBus = tetra.common.EventBus;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;
    import MessageLog = tetra.common.MessageLog;

    export class DashboardController {
        private project: IProjectSummaryData = null;
        private $http: ng.IHttpService;
        private $location: ng.ILocationService;
        private projectService: ProjectService;
        private log = new MessageLog();

        model: DashboardSummary;

        constructor($routeParams: ng.route.IRouteParamsService, $http: ng.IHttpService, $location: ng.ILocationService, projectService: ProjectService, eventBus: EventBus) {
            this.$http = $http;
            this.$location = $location;
            this.projectService = projectService;

            var projectCode = $routeParams['project'];
            this.loadDashboard(projectCode);
        }

        loadDashboard(projectCode: string): void {
            this.$http.get<IDashboardData>(`/api/analytics/${projectCode}`)
                .success(result => this.model = new DashboardSummary(result))
                .error(err => this.log.addErrorResponse(err));
        }

        loadProject(projectCode: string): void {
            this.projectService.getProjectByCode(projectCode)
                .success(project => this.project = project)
                .error(err => this.log.addErrorResponse(err));
        }
    }

    angular.module('app').controller('dashboardCtrl', DashboardController);
}