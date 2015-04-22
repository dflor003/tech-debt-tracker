/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../common/event-bus.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="new-tech-debt-item.ts" />

module tetra.techdebt {
    import SessionService = tetra.auth.SessionService;
    import ITechDebtListItemData = tetra.techdebt.ITechDebtListItemData;
    import TechDebtListItem = tetra.techdebt.TechDebtListItem;
    import Notifier = tetra.common.Notifier;
    import EventBus = tetra.common.EventBus;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;

    export class CreateTechDebtController {
        private $http: ng.IHttpService;
        private $location: ng.ILocationService;
        private notifier: Notifier;
        private projectCode: string;

        model = new NewTechDebtItem();

        constructor($routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, notifier: Notifier, eventBus: EventBus) {
            this.$location = $location;
            this.$http = $http;
            this.notifier = notifier;

            this.projectCode = $routeParams['project'];
            eventBus.on('project-changed', (newProject: IProjectSummaryData) => {
                $location.path(`/techdebt/${newProject.code.toLowerCase()}`);
            });
        }

        save(): void {
            this.$http.post(`/api/${this.projectCode}/techdebt`, this.model.toData());
        }
    }

    angular.module('app').controller('createTechDebtCtrl', CreateTechDebtController);
}