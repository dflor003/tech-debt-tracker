/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="tech-debt-list-item.ts" />

module tetra.browse {
    import ITechDebtListItemData = tetra.browse.ITechDebtListItemData;
    import TechDebtListItem = tetra.browse.TechDebtListItem;
    import Notifier = tetra.common.Notifier;

    export class TechDebtListController {
        private $http: ng.IHttpService;
        private items: TechDebtListItem[] = [];
        private notifier: Notifier;
        private productCode: string;
        private currentPage = 0;
        private pageSize = 20;

        constructor($routeParams: ng.route.IRouteParamsService, $http: ng.IHttpService, notifier: Notifier) {
            this.$http = $http;
            this.notifier = notifier;
            this.productCode = $routeParams['product'];
            this.loadItems(0);
        }

        loadItems(page: number) {
            this.currentPage = page;
            this.getTechDebtList(this.productCode, page, this.pageSize)
                .success(response => {
                    this.items = response.map(data => new TechDebtListItem(data));
                })
                .error(err => {
                    this.notifier.error(err, 'An error occurred.')
                });
        }

        getTechDebtList(product: string, pageNum: number, pageSize: number): ng.IHttpPromise<ITechDebtListItemData[]> {
            return this.$http.get(`/api/${product}/techdebt/?page=${pageNum}&per_page=${pageSize}`);
        }
    }

    angular.module('app').controller('techDebtListCtrl', TechDebtListController);
}