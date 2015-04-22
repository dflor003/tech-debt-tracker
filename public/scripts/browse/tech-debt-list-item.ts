/// <reference path="../libs.d.ts" />

module tetra.browse {
    import Moment = moment.Moment;
    import Duration = moment.Duration;

    export interface ITechDebtListItemData {
        id: string;
        name: string;
        description: string;
        updatedAt: string;
        cost: number;
        impedimentCount: number;
        slowdowns: string[];
    }

    export class TechDebtListItem {
        private id: string;
        private name: string;
        private description: string;
        private updatedAt: Moment;
        private cost: Numeral;
        private impedimentCount: number;
        private slowdowns: Duration[];
        private totalSlowdown: Duration;

        constructor(data?: ITechDebtListItemData) {
            data = data || <any>{};
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
            this.updatedAt = moment(data.updatedAt);
            this.cost = numeral(data.cost);
            this.impedimentCount = data.impedimentCount;
            this.slowdowns = data.slowdowns.map(slowdown => moment.duration(slowdown));
            this.totalSlowdown = moment.duration();
            this.slowdowns.forEach(slowdown => this.totalSlowdown.add(slowdown));
        }
    }
}