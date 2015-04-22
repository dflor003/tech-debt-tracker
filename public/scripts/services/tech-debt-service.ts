/// <reference path="../libs.d.ts" />

module tetra.services {

    export interface ITechDebtListItemData {
        id: string;
        name: string;
        description: string;
        updatedAt: string;
    }

    export class TechDebtService {
        private $http: ng.IHttpService;
        private $q: ng.IQService;

        constructor($http: ng.IHttpService, $q: ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }

        getTechDebtList(product: string, pageNum: number, pageSize: number): ng.IHttpPromise<ITechDebtListItemData[]> {
            return this.$http.get(`/api/${product}/techdebt/?page=${pageNum}&per_page=${pageSize}`);
        }
    }

    angular.module('app').service('techDebtService', TechDebtService);
}