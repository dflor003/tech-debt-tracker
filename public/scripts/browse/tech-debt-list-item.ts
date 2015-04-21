/// <reference path="../services/tech-debt-service.ts" />

module tetra.browse {
    import ITechDebtListItemData = tetra.services.ITechDebtListItemData;

    export class TechDebtListItem {
        private id: string;
        private name: string;
        private description: string;

        constructor(data?: ITechDebtListItemData) {
            data = data || <any>{};
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
        }
    }
}