/// <reference path="../libs.d.ts" />
/// <reference path="../services/project-service.ts" />

module tetra.dashboard {
    import IProjectSummaryData = tetra.services.IProjectSummaryData;

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
        costPerHour: number;
        totalCost: Numeral;
        totalTimeLost: number;
        techDebt: any[];
        percentOfBudget: number;

        constructor(data: IDashboardData) {
            this.project = data.project;
            this.budget = numeral(data.budget);
            this.costPerHour = data.costPerHour;
            this.totalCost = numeral(data.totalCost);
            this.totalTimeLost = data.totalTimeLost;
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
            this.percentOfBudget = this.isOverBudget ? 1 : (this.totalCost.value() / this.budget.value());
        }

        get percentOfBudgetDisplay(): string {
            return (100 * this.percentOfBudget).toFixed(2)
        }

        get remainingBudget(): Numeral {
            return numeral(this.budget.value() - this.totalCost.value());
        }

        get isOverBudget(): boolean {
            return this.totalCost.value() > this.budget.value();
        }

        getProgressClass(): string {
            if (this.percentOfBudget > 0.5) {
                return 'warning';
            }

            if (this.percentOfBudget > 0.80) {
                return 'danger';
            }

            return null;
        }
    }
}