/// <reference path="../libs.d.ts" />
/// <reference path="../services/project-service.ts" />

module tetra.dashboard {
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import Moment = moment.Moment;
    import Duration = moment.Duration;

    export interface IDashboardData {
        project: IProjectSummaryData;
        budget: number;
        costPerHour: number;
        totalCost: number;
        totalTimeLost: number;
        techDebt
    }

    export interface ITechDebtData {
        id: string;
        name: string;
        createdAt: string;
        reporterId: string;
        cost: number;
        timeLost: string;
    }

    export class DashboardSummary {
        project: IProjectSummaryData;
        budget: Numeral;
        costPerHour: Numeral;
        totalCost: Numeral;
        totalTimeLost: Duration;
        techDebt: any[];
        percentOfBudget: number;
        warningThreshold = 0.6;
        dangerThreshold = 0.8;

        constructor(data: IDashboardData) {
            this.project = data.project;
            this.budget = numeral(data.budget);
            this.costPerHour = numeral(data.costPerHour);
            this.totalCost = numeral(data.totalCost);
            this.totalTimeLost = moment.duration(data.totalTimeLost, 'hours');
            this.techDebt = Enumerable
                .from(data.techDebt)
                .select((item: ITechDebtData) => {
                    return {
                        id: item.id,
                        name: item.name,
                        createdAt: moment(item.createdAt, moment.ISO_8601),
                        reporterId: item.reporterId,
                        cost: numeral(item.cost),
                        timeLost: moment.duration(item.timeLost)
                    };
                })
                .toArray();
            this.percentOfBudget = this.totalCost.value() / this.budget.value();
        }

        get calculationTooltip(): string {
            return `Calculation: ${this.totalTimeLost.asHours()} hours &times; ${this.costPerHour.format('$0,0.00')} avg dev hourly cost`
        }

        get remainingBudget(): Numeral {
            return numeral(this.budget.value() - this.totalCost.value());
        }

        get amountOverBudget(): Numeral {
            return !this.isOverBudget ? numeral(0) : numeral(Math.abs(this.remainingBudget.value()));
        }

        get isOverBudget(): boolean {
            return this.totalCost.value() > this.budget.value();
        }

        get progressBarPercent(): string {
            return Math.min(100, (100 * this.percentOfBudget)).toFixed(2);
        }

        getProgressClass(): string {
            if (this.percentOfBudget > this.dangerThreshold) {
                return 'danger';
            }

            if (this.percentOfBudget > this.warningThreshold) {
                return 'warning';
            }

            return 'success';
        }
    }
}