/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../auth/session-service.ts" />
/// <reference path="../auth/auth-service.ts" />

module tetra.common {
    import SessionService = tetra.auth.SessionService;
    import AuthService = tetra.auth.AuthService;
    import LoggedInUser = tetra.auth.LoggedInUser;
    import Notifier = tetra.common.Notifier;
    import IProjectSummaryData = tetra.services.IProjectSummaryData;

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

        get currentProjectCode(): string {
            return this.sessionService.selectedProjectCode;
        }

        get currentProject(): IProjectSummaryData {
            return this.sessionService.selectedProject;
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

        isActive(...paths: string[]): boolean {
            return Enumerable.from(paths).any(path => this.isPathActive(path));
        }

        private isPathActive(path: string): boolean {
            var activePath = this.$location.path(),
                activeParts = activePath.split('/').filter(str => !!str),
                pathParts = path.split('/').filter(str => !!str);

            if (pathParts.length !== activeParts.length) {
                return false;
            }

            for(var i = 0; i < activeParts.length; i++) {
                var currentExpected = pathParts[i].toLowerCase(),
                    currentActive = activeParts[i].toLowerCase();

                if (currentExpected === '*') {
                    continue;
                }

                if (currentExpected !== currentActive) {
                    return false;
                }
            }

            return true;
        }
    }

    angular.module('app').controller('rootCtrl', RootController);
}