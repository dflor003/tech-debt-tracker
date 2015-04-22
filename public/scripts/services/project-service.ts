/// <reference path="../libs.d.ts" />

module tetra.services {

    export interface IProjectSummaryData {
        code: string;
        name: string;
        description: string;
        devHourlyCost: number;
    }

    export class ProjectService {
        private $http: ng.IHttpService;
        private $q: ng.IQService;

        constructor($http: ng.IHttpService, $q: ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }

        getProjectByCode(projectCode: string): ng.IHttpPromise<IProjectSummaryData[]> {
            return this.$http.get(`/api/projects/${projectCode}`);
        }
    }

    angular.module('app').service('projectService', ProjectService);
}