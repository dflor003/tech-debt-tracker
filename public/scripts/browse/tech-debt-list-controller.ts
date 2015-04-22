/// <reference path="../libs.d.ts" />
/// <reference path="../services/tech-debt-service.ts" />
/// <reference path="tech-debt-list-item.ts" />

module tetra.browse {
    import TechDebtService = tetra.services.TechDebtService;
    import ITechDebtListItemData = tetra.services.ITechDebtListItemData;
    import TechDebtListItem = tetra.browse.TechDebtListItem;

    export class TechDebtListController {
        private techDebtService: TechDebtService;
        private items: TechDebtListItem[] = [];
        private productCode: string;

        constructor($routeParams: ng.route.IRouteParamsService, techDebtService: TechDebtService) {
            this.techDebtService = techDebtService;
            this.productCode = $routeParams['product'];
            this.techDebtService.getTechDebtList(this.productCode, 0, 20)
                .success(response => {
                    this.items = response.map(data => new TechDebtListItem(data));
                })
                .error(err => this.items)
        }
    }

    angular.module('app').controller('techDebtListCtrl', TechDebtListController);
}