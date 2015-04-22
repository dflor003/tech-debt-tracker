/// <reference path="session-service.ts" />

module tetra.auth {
    export class SecurityHelper {
        static NotAuthorized: string = 'NotAuthorized';

        static requiresLogin(): any {
            return {
                auth: (sessionService: SessionService, $q: ng.IQService): any => {
                    if (sessionService.isLoggedIn) {
                        return true;
                    } else {
                        return $q.reject(SecurityHelper.NotAuthorized);
                    }
                }
            };
        }
    }
}