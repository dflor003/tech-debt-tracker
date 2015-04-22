/// <reference path="../services/tech-debt-service.ts" />
/// <reference path="../libs.d.ts" />

module tetra.browse {
    import ITechDebtListItemData = tetra.services.ITechDebtListItemData;
    import Moment = moment.Moment;

    export class TechDebtListItem {
        private id: string;
        private name: string;
        private description: string;
        private updatedAt: Moment;

        constructor(data?: ITechDebtListItemData) {
            data = data || <any>{};
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
            this.updatedAt = moment(data.updatedAt);
        }
    }
}