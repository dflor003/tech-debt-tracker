/// <reference path="../libs.d.ts" />

module tetra.common {

    export class Notifier {
        private $toastr: Toastr;

        constructor($toastr: Toastr) {
            this.$toastr = $toastr;
            this.$toastr.options.positionClass = 'toast-top-right';
        }

        success(message: string, title?: string): void {
            this.$toastr.success(message, title);
        }

        error(message: string, title?: string): void {
            this.$toastr.error(message, title);
        }
    }

    angular
        .module('app')
        .value('$toastr', toastr)
        .factory('notifier', ($toastr: Toastr) => {
            return new Notifier($toastr);
        });
}