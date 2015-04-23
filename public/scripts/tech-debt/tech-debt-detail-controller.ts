/// <reference path="../libs.d.ts" />
/// <reference path="tech-debt-detail.ts" />

module tetra.techdebt {
    import EventBus = tetra.common.EventBus;
    import MessageLog = tetra.common.MessageLog;

    export class TechDebtDetailController {
        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private projectCode: string;
        private itemId: string;
        private model: TechDebtDetail = null;
        private log: MessageLog = new MessageLog();

        constructor($routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, eventBus: EventBus) {
            this.$location = $location;
            this.$http = $http;

            this.projectCode = $routeParams['project'];
            this.itemId = $routeParams['id'];

            eventBus.on('project-changed', (newProject) => this.$location.path(`/techdebt/${newProject.code}`));
            this.loadDetail();
        }

        loadDetail(): void {
            this.$http.get<ITechDebtDetailData>(`/api/techdebt/${this.projectCode}/${this.itemId}`)
                .success(result => {
                    this.model = new TechDebtDetail(result);
                })
                .error(err => this.log.addErrorResponse(err));
        }
    }

    angular.module('app').controller('techDebtDetailCtrl', TechDebtDetailController);
}