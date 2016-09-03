/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../common/event-bus.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="new-tech-debt-item.ts" />
/// <reference path="../common/message-log.ts" />

module tetra.techdebt {
    import SessionService = tetra.auth.SessionService;
    import ITechDebtListItemData = tetra.techdebt.ITechDebtListItemData;
    import TechDebtListItem = tetra.techdebt.TechDebtListItem;
    import Notifier = tetra.common.Notifier;
    import EventBus = tetra.common.EventBus;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;
    import Duration = moment.Duration;
    import MessageLog = tetra.common.MessageLog;

    export class SlowdownAmount {
        id: string;
        label: string;
        amount: Duration;

        constructor(id: string, label: string, amount: Duration) {
            this.id = id;
            this.label = label;
            this.amount = amount;
        }
    }

    export class CreateTechDebtController {
        private $http: ng.IHttpService;
        private $location: ng.ILocationService;
        private notifier: Notifier;
        private projectCode: string;
        private log = new MessageLog();

        slowdowns: SlowdownAmount[];
        model = new NewTechDebtItem();

        constructor($routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, $http: ng.IHttpService, notifier: Notifier, eventBus: EventBus) {
            this.$location = $location;
            this.$http = $http;
            this.notifier = notifier;

            var workdayHours = 8;
            this.slowdowns = [
                new SlowdownAmount('sm', 'Half a day', moment.duration(workdayHours / 2, 'hours')),
                new SlowdownAmount('md', 'About a day', moment.duration(workdayHours, 'hours')),
                new SlowdownAmount('lg', 'A couple of days', moment.duration(workdayHours * 2, 'hours')),
                new SlowdownAmount('xl', 'Most of the week', moment.duration(workdayHours * 5, 'hours')),
            ];

            this.projectCode = $routeParams['project'];
            eventBus.on('project-changed', (newProject: IProjectSummaryData) => {
                $location.path(`/techdebt/${newProject.code.toLowerCase()}`);
            });
        }

        save($form: ng.IFormController): void {
            this.log.clearAll();
            if ($form.$invalid) {
                this.log.addError('Please fix all errors before submitting');
                return;
            }

            this.$http.post(`/api/${this.projectCode}/techdebt`, this.model.toData())
                .success((newItem: any) => this.$location.path(`/techdebt/${this.projectCode.toLowerCase()}/${newItem.id}`))
                .error(err => this.log.addErrorResponse(err));
        }

        cancel(): void {
            this.$location.path(`/techdebt/${this.projectCode.toLowerCase()}`);
        }
    }

    angular.module('app').controller('createTechDebtCtrl', CreateTechDebtController);
}