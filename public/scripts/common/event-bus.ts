/// <reference path="../libs.d.ts" />

module tetra.common {
    export class EventBus {
        private $rootScope: ng.IRootScopeService;

        constructor($rootScope: ng.IRootScopeService) {
            this.$rootScope = $rootScope;

        }

        fire(event: string, ...args: any[]): void {
            this.$rootScope.$broadcast.apply(this.$rootScope,[event].concat(args));
        }

        on(event: string, handler: (...args: any[]) => void): EventBus {
            this.$rootScope.$on(event, (evt, ...args: any[]) => {
                handler.apply(null, args);
            });

            return this;
        }
    }

    angular.module('app').service('eventBus', EventBus);
}