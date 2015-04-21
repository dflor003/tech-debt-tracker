/// <reference path="identity-service.ts" />

module tetra.auth {
    export class SecurityHelper {
        static NotAuthorized: string = 'NotAuthorized';

        static requiresLogin(): any {
            return {
                auth: (identityService: IdentityService, $q: ng.IQService): any => {
                    if (identityService.isLoggedIn) {
                        return true;
                    } else {
                        return $q.reject(SecurityHelper.NotAuthorized);
                    }
                }
            };
        }
    }
}