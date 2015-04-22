/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="auth-service.ts" />
/// <reference path="identity-service.ts" />

module tetra.auth {
    import Notifier = tetra.common.Notifier;

    export class LoginModel {
        username: string = '';
        password: string = '';
    }

    export class LoginController {
        private $location: ng.ILocationService;
        private model: LoginModel;
        private identityService: IdentityService;
        private notifier: Notifier;

        constructor($location: ng.ILocationService, identityService: IdentityService, notifier: Notifier) {
            this.$location = $location;
            this.identityService = identityService;
            this.model = new LoginModel();
            this.notifier = notifier;
        }

        login(): void {
            var username = this.model.username,
                password = this.model.password;

            this.identityService.loginUser(username, password)
                .then(user => {
                    this.notifier.success('Logged in successfully!');

                    var productCode = Enumerable.from(user.products).first();
                    this.$location.path(`/techdebt/${productCode}`);
                })
                .catch(message => this.notifier.error(message, 'Could not log in'));
        }
    }

    angular.module('app').controller('loginCtrl', LoginController);
}