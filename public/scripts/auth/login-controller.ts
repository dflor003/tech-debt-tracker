/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="auth-service.ts" />
/// <reference path="session-service.ts" />
/// <reference path="../services/project-service" />

module tetra.auth {
    import Notifier = tetra.common.Notifier;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;
    import ProjectService = tetra.services.ProjectService;

    export class LoginModel {
        username: string = '';
        password: string = '';
    }

    export class LoginController {
        private $location: ng.ILocationService;
        private model: LoginModel;
        private notifier: Notifier;
        private sessionService: SessionService;

        constructor($location: ng.ILocationService, sessionService: SessionService, notifier: Notifier) {
            this.$location = $location;
            this.sessionService = sessionService;
            this.model = new LoginModel();
            this.notifier = notifier;
        }

        login(): void {
            var username = this.model.username,
                password = this.model.password;

            this.sessionService.loginUser(username, password)
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