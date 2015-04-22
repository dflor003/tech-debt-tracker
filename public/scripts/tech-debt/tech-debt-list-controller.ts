/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../common/event-bus.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="tech-debt-list-item.ts" />

module tetra.techdebt {
    import SessionService = tetra.auth.SessionService;
    import ITechDebtListItemData = tetra.techdebt.ITechDebtListItemData;
    import TechDebtListItem = tetra.techdebt.TechDebtListItem;
    import Notifier = tetra.common.Notifier;
    import EventBus = tetra.common.EventBus;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;

    export class TechDebtListController {
        private $http: ng.IHttpService;
        private $location: ng.ILocationService;
        private sessionService: SessionService;
        private projectService: ProjectService;
        private notifier: Notifier;
        private items: TechDebtListItem[] = [];
        private project: IProjectSummaryData;
        private currentPage = 0;
        private pageSize = 20;

        constructor($routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, sessionService: SessionService, projectService: ProjectService, notifier: Notifier, eventBus: EventBus) {
            this.$location = $location;
            this.$http = $http;
            this.sessionService = sessionService;
            this.projectService = projectService;
            this.notifier = notifier;

            var projectCode = $routeParams['project'];
            if (!projectCode) {
                var currentProjectCode = sessionService.selectedProjectCode;
                $location.path(!currentProjectCode ? '/dashboard' : `/techdebt/${currentProjectCode}`)
            } else {
                this.init(projectCode);
            }

            eventBus.on('project-changed', (newProject: IProjectSummaryData) => {
                $location.path(`/techdebt/${newProject.code.toLowerCase()}`);
            });
        }

        init(projectCode: string): void {
            this.projectService.getProjectByCode(projectCode)
                .success(project => {
                    this.project = project;
                    this.loadItems(0);
                })
                .error(err => this.notifier.error(err));
        }

        loadItems(page: number): void {
            this.currentPage = page;
            this.getTechDebtList(this.project.code, page, this.pageSize)
                .success(response => {
                    this.items = response.map(data => new TechDebtListItem(data));
                })
                .error(err => {
                    this.notifier.error(err, 'An error occurred.')
                });
        }

        getTechDebtList(projectCode: string, pageNum: number, pageSize: number): ng.IHttpPromise<ITechDebtListItemData[]> {
            return this.$http.get(`/api/${projectCode}/techdebt/?page=${pageNum}&per_page=${pageSize}`);
        }
    }

    angular.module('app').controller('techDebtListCtrl', TechDebtListController);
}