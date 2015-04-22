/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../common/event-bus.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="tech-debt-list-item.ts" />

module tetra.techdebt {
    import Duration = moment.Duration;

    export class NewTechDebtItem {
        name: string;
        description: string;
        jira: string;
        amount: Duration;
        reason: string;

        constructor() {
            this.name = '';
            this.description = '';
            this.jira = '';
            this.amount = moment.duration();
            this.reason = '';
        }

        toData(): Object {
            return {
                name: this.name,
                description: this.description,
                impediment: {
                    jira: this.jira,
                    amount: this.amount,
                    reason: this.reason
                }
            };
        }
    }
}