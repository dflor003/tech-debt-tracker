/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="../auth/auth-service.ts" />

module tetra.common {
    import SessionService = tetra.auth.SessionService;
    import AuthService = tetra.auth.AuthService;
    import LoggedInUser = tetra.auth.LoggedInUser;
    import Notifier = tetra.common.Notifier;

    export class RootController {
        private $location: ng.ILocationService;
        private sessionService: SessionService;
        private notifier: Notifier;

        constructor($location: ng.ILocationService, sessionService: SessionService, notifier: Notifier) {
            this.$location = $location;
            this.sessionService = sessionService;
            this.notifier = notifier;
        }

        get isLoggedIn(): boolean {
            return this.sessionService.isLoggedIn;
        }

        get currentUser(): LoggedInUser {
            return this.sessionService.currentUser;
        }

        get currentProject(): string {
            return this.sessionService.selectedProjectCode;
        }

        changeProject(projectCode: string): void {
            this.sessionService.setCurrentProject(projectCode);
        }

        logout(): void {
            this.sessionService.logoutUser()
                .then(() => {
                    this.notifier.success('Successfully logged out!');
                    this.$location.path('/login')
                })
                .catch(err => this.notifier.error(err, 'Error logging out'));
        }

        isActive(area: string): boolean {
            var path = this.$location.path();
            return path.indexOf(`/${area}`) === 0;
        }
    }

    angular.module('app').controller('rootCtrl', RootController);
}