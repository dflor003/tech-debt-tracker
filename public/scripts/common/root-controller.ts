/// <reference path="../libs.d.ts" />
/// <reference path="../common/notifier.ts" />
/// <reference path="../auth/identity-service.ts" />
/// <reference path="../auth/auth-service.ts" />

module tetra.common {
    import IdentityService = tetra.auth.IdentityService;
    import AuthService = tetra.auth.AuthService;
    import LoggedInUser = tetra.auth.LoggedInUser;
    import Notifier = tetra.common.Notifier;

    export class RootController {
        private $location: ng.ILocationService;
        private identityService: IdentityService;
        private notifier: Notifier;

        constructor($location: ng.ILocationService, identityService: IdentityService, notifier: Notifier) {
            this.$location = $location;
            this.identityService = identityService;
            this.notifier = notifier;
        }

        get isLoggedIn(): boolean {
            return this.identityService.isLoggedIn;
        }

        get currentUser(): LoggedInUser {
            return this.identityService.currentUser;
        }

        logout(): void {
            this.identityService.logoutUser()
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