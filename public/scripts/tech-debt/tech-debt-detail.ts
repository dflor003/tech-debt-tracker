/// <reference path="../libs.d.ts" />

module tetra.techdebt {
    import Moment = moment.Moment;
    import Duration = moment.Duration;

    export interface ITechDebtDetailData {
        id: string;
        name: string;
        description: string;
        impediments: any[]
        devHourCost: number;
        createdAt: string;
    }

    export interface IImpedimentDetail {
        reportedBy: string;
        jira: string;
        reason: string;
        amount: Duration;
        createdAt: Moment;
        cost: Numeral;
    }

    export class TechDebtDetail {
        id: string;
        name: string;
        description: string;
        impediments: IImpedimentDetail[];
        devHourCost: number;
        totalCost: Numeral;
        totalDuration: Duration;
        createdAt: Moment;

        constructor(data: ITechDebtDetailData) {
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
            this.devHourCost = data.devHourCost;
            this.createdAt = moment(data.createdAt, moment.ISO_8601);

            var totalCost = 0,
                totalHours = 0;
            this.impediments = Enumerable
                .from(data.impediments)
                .select(impediment => {
                    var timeSpent = moment.duration(impediment.amount),
                        cost = this.devHourCost * timeSpent.asHours();

                    totalCost += cost;
                    totalHours += timeSpent.asHours();
                    return <IImpedimentDetail>{
                        reportedBy: `${impediment.reporter.firstName} ${impediment.reporter.lastName}`,
                        jira: impediment.jira,
                        reason: impediment.reason,
                        amount: timeSpent,
                        cost: numeral(cost),
                        createdAt: moment(impediment.createdAt, moment.ISO_8601)
                    };
                })
                .orderByDescending(impediment => impediment.createdAt.toDate())
                .toArray();

            this.totalCost = numeral(totalCost);
            this.totalDuration = moment.duration(totalHours, 'hours');
        }
    }
}